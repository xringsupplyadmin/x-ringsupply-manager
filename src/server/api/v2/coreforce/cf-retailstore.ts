import { urlJoinP } from "url-join-ts";
import { z } from "zod/v4";
import { env } from "~/env";
import { fetchSession } from "~/lib/server_utils";
import { authorize } from "~/server/api/v2/coreforce/cf-admin/cf-admin-api";
import { RetailStoreCart } from "~/server/api/v2/coreforce/types/retail-store";

const RetailStoreCartResponse = RetailStoreCart.extend({
  requires_user: z.undefined(),
}).or(
  z.object({
    requires_user: z.string(),
  }),
);

export async function getShoppingCartItems(cfContactId: number) {
  await authorize();

  const response = await fetchSession(
    urlJoinP(env.NEXT_PUBLIC_CF_HOST, ["retail-store-controller"], {
      ajax: true,
      url_action: "get_shopping_cart_items",
      contact_id: cfContactId,
    }),
    {
      method: "GET",
      cache: "no-cache",
    },
  );

  const responseData = RetailStoreCartResponse.safeParse(await response.json());

  if (!responseData.success) {
    throw new Error(responseData.error.message);
  }

  if (responseData.data.requires_user !== undefined) {
    throw new Error("AUTH: RetailStoreController Authentication Rejected");
  }

  return responseData.data.shopping_cart_items;
}
