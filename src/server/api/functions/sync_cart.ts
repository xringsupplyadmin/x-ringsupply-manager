import e from "@/dbschema/edgeql-js";
import client from "~/server/db/client";
import { newTiming, timing, type ApiResponse } from "../common";
import { authorize } from "./cf_authorization";
import { getShoppingCart } from "./fetch_cart";

export async function syncCartToDb(checkAuth = true): Promise<
  ApiResponse<{
    successCount: number;
    productCount: number;
    addonCount: number;
    failedIds: number[];
  }>
> {
  if (checkAuth) {
    const authorization = await authorize();
    if (!authorization.success) {
      return authorization;
    }
  }

  const tRef = newTiming();

  console.debug("[syncCartToDb] init");

  const allData = await e
    .select(e.coreforce.Contact, () => ({
      id: true,
      contactId: true,
    }))
    .run(client);

  console.debug("[syncCartToDb] Get contact data:", timing(tRef, true));

  let successCount = 0;
  let productCount = 0;
  let addonCount = 0;
  const failedIds: number[] = [];

  for (const { id, contactId } of allData) {
    const cart = await getShoppingCart(contactId, false);

    if (!cart.success) {
      console.error(contactId, cart.error);
      failedIds.push(contactId);
      continue;
    }

    await client.transaction(async (tx) => {
      await e
        .delete(e.coreforce.CartItem, (item) => ({
          filter: e.op(item.contact.contactId, "=", contactId),
        }))
        .run(tx);

      const contact = e.select(e.coreforce.Contact, (c) => ({
        filter_single: e.op(c.id, "=", e.uuid(id)),
      }));

      const items = cart.cart.shopping_cart_items.map((item) => ({
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
          contact: contact,
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
        productCount++;

        const insertedProduct = await e
          .insert(e.coreforce.CartItem, item.item)
          .run(tx);

        const linkItem = e.select(e.coreforce.CartItem, (i) => ({
          filter_single: e.op(i.id, "=", e.uuid(insertedProduct.id)),
        }));

        for (const addon of item.addons) {
          addonCount++;
          await e
            .insert(e.coreforce.ProductAddon, {
              ...addon,
              cartItem: linkItem,
            })
            .run(tx);
        }
      }
    });

    successCount++;
  }

  console.debug("[syncCartToDb] Done in ", timing(tRef, true, true));

  return {
    success: true,
    successCount: successCount,
    productCount: productCount,
    addonCount: addonCount,
    failedIds: failedIds,
  };
}
