import e from "@/dbschema/edgeql-js";
import { fetchApiCart } from "~/server/api/functions/retailstore/fetch_cart";
import client from "~/server/db/client";
import { inngest } from "../../inngest";
import logInngestError from "./error_handling";

export const updateContactCart = inngest.createFunction(
  {
    id: "updateContactCart",
    name: "Update Contact Cart",
    onFailure: logInngestError,
    concurrency: 5,
  },
  { event: "contact/update.cart" },
  async ({ event, step }) => {
    const cfContactId = await step.run("get-contact-id", async () => {
      const contact = await e
        .select(e.coreforce.Contact, (c) => ({
          filter_single: e.op(c.id, "=", e.uuid(event.data.contactId)),
          cfContactId: true,
        }))
        .run(client);

      if (!contact) {
        throw new Error("Contact not found");
      }

      return contact.cfContactId;
    });

    const apiItems = await step.invoke("fetch-cart-items", {
      function: fetchApiCart,
      data: {
        cfContactId: cfContactId,
      },
    });

    const removedCount = await step.run("clear-cart-items", async () => {
      // Delete all current cart items for the contact
      return (
        await e
          .delete(e.coreforce.CartItem, (item) => ({
            filter: e.op(item.contact.id, "=", e.uuid(event.data.contactId)),
          }))
          .run(client)
      ).length;
    });

    // Short circuit if there are no items
    if (apiItems.length === 0) {
      return {
        removed: removedCount,
        added: 0,
      };
    }

    await step.run(`update-cart-items`, async () => {
      {
        await client.transaction(async (tx) => {
          // Get the detached query for the contact
          const contactQuery = e.select(e.coreforce.Contact, (c) => ({
            filter_single: e.op(c.id, "=", e.uuid(event.data.contactId)),
          }));

          for (const item of apiItems) {
            // Insert the product
            await e
              .insert(e.coreforce.CartItem, {
                cartItemId: item.shopping_cart_item_id,
                cartId: item.shopping_cart_id,
                productId: item.product_id,
                description: item.description,
                timeSubmitted: new Date(item.time_submitted),
                quantity: item.quantity,
                unitPrice: item.unit_price,
                listPrice: item.list_price,
                smallImageUrl: item.small_image_url,
                imageUrl: item.image_url,
                contact: contactQuery,
              })
              .run(tx);
          }
        });
      }
    });

    return {
      removed: removedCount,
      added: apiItems.length,
    };
  },
);
