import e from "@/dbschema/edgeql-js";
import client from "~/server/db/client";
import { type ApiResponse } from "../common";
import { type RetailStoreCart } from "./fetch_cart";

export async function syncCartToDb(
  contact: { id: string; contactId: number },
  cart: RetailStoreCart,
): Promise<ApiResponse<{ count: number }>> {
  await client.transaction(async (tx) => {
    // Delete all current cart items for the contact
    await e
      .delete(e.coreforce.CartItem, (item) => ({
        filter: e.op(item.contact.contactId, "=", contact.contactId),
      }))
      .run(tx);

    // Short circuit if there are no items
    if (cart.shopping_cart_items.length === 0) {
      return;
    }

    // Get the detached query for the contact
    const contactQuery = e.select(e.coreforce.Contact, (c) => ({
      filter_single: e.op(c.id, "=", e.uuid(contact.id)),
    }));

    // Map the cart items to the DB format
    const items = cart.shopping_cart_items.map((item) => ({
      item: {
        cartItemId: item.shopping_cart_item_id,
        cartId: item.shopping_cart_id,
        productId: item.product_id,
        description: item.description,
        timeSubmitted: item.time_submitted,
        quantity: item.quantity,
        salePrice: item.sale_price,
        unitPrice: item.unit_price,
        upcCode: item.upc_code,
        manufacturerSku: item.manufacturer_sku,
        model: item.model,
        listPrice: item.list_price,
        smallImageUrl: item.small_image_url,
        imageUrl: item.image_url,
        contact: contactQuery,
      },
      addons: item.product_addons.map((addon) => ({
        productAddonId: addon.product_addon_id,
        productId: addon.product_id,
        description: addon.description,
        groupDescription: addon.group_description,
        salePrice: addon.sale_price,
        sortOrder: addon.sort_order,
        cartItemAddonId: addon.shopping_cart_item_addon_id,
        cartItemId: addon.shopping_cart_item_id,
        quantity: addon.quantity,
      })),
    }));

    for (const item of items) {
      // Insert the product
      const insertedProduct = await e
        .insert(e.coreforce.CartItem, item.item)
        .run(tx);

      // Get the detached query for the product
      const linkItem = e.select(e.coreforce.CartItem, (i) => ({
        filter_single: e.op(i.id, "=", e.uuid(insertedProduct.id)),
      }));

      // Insert the addons
      for (const addon of item.addons) {
        await e
          .insert(e.coreforce.ProductAddon, {
            ...addon,
            cartItem: linkItem,
          })
          .run(tx);
      }
    }
  });

  return {
    success: true,
    count: cart.shopping_cart_items.length,
  };
}
