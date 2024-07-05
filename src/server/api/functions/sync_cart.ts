import e from "@/dbschema/edgeql-js";
import client from "~/server/db/client";
import { newTiming, timing, type ApiResponse } from "../common";
import { authorize } from "./cf_authorization";
import { getShoppingCart } from "./fetch_cart";

export async function syncCartToDb(
  checkAuth = true,
): Promise<ApiResponse<{ successCount: number; failedIds: number[] }>> {
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

      const items = cart.cart.shopping_cart_items.map((item) => ({
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
        contact: e.select(e.coreforce.Contact, (c) => ({
          filter_single: e.op(c.id, "=", e.uuid(id)),
        })),
      }));
      const addons = cart.cart.shopping_cart_items.flatMap((item) =>
        item.product_addons.map((addon) => ({
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
      );

      for (const item of items) {
        await e.insert(e.coreforce.CartItem, item).run(tx);
      }

      for (const addon of addons) {
        await e.insert(e.coreforce.ProductAddon, addon).run(tx);
      }
    });

    successCount++;
  }

  console.debug("[syncContactsToDb] Done in ", timing(tRef, true, true));

  return {
    success: true,
    successCount: successCount,
    failedIds: failedIds,
  };
}
