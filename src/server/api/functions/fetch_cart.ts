import { z } from "zod";
import { authorize } from "./cf_authorization";
import { type ApiResponse, fetchSession } from "../common";
import { urlJoinP } from "url-join-ts";
import { env } from "~/env";

const formattedNumber = z.preprocess(
  (num) =>
    typeof num === "string"
      ? Number(num.replaceAll(",", ""))
      : z.coerce.number().parse(num),
  z.number(),
);

const safeUrl = (fallback: string) =>
  z.preprocess((str) => {
    if (str === "") {
      return fallback;
    }

    const res = z.string().url().safeParse(str);
    if (res.success) {
      return res.data;
    } else {
      return fallback;
    }
  }, z.string().url());

/**
 * The response from the CF API for the cart items
 *
 * I hate this so much, for sanity sake keep this definition minimized
 */
const RetailStoreCart = z.object({
  shopping_cart_items: z
    .object({
      shopping_cart_item_id: z.number(),
      shopping_cart_id: z.number(),
      product_id: z.number(),
      description: z.string(),
      time_submitted: z.date({
        coerce: true,
      }),
      quantity: z.number(),
      sale_price: formattedNumber,
      product_addons: z
        .union([z.never().array(), z.object({}).passthrough()])
        .transform((addons) => {
          if (Array.isArray(addons)) {
            return addons;
          }

          return z
            .object({
              product_addon_id: z.number(),
              product_id: z.number(),
              description: z.string(),
              group_description: z.string(),
              sale_price: formattedNumber,
              sort_order: z.number(),
              shopping_cart_item_addon_id: z.number(),
              shopping_cart_item_id: z.number(),
              quantity: z.number(),
            })
            .array()
            .parse(Object.values(addons));
        }),
      unit_price: formattedNumber,
      upc_code: z.string().transform((str) => (str === "" ? undefined : str)),
      manufacturer_sku: z
        .string()
        .transform((str) => (str === "" ? undefined : str)),
      model: z.string().transform((str) => (str === "" ? undefined : str)),
      list_price: formattedNumber,
      small_image_url: safeUrl(
        "https://placehold.co/300/jpg?text=Image+Not+Found",
      ),
      image_url: safeUrl("https://placehold.co/600/jpg?text=Image+Not+Found"),
    })
    .array(),
});
export type RetailStoreCart = z.infer<typeof RetailStoreCart>;

const RetailStoreCartResponse = RetailStoreCart.extend({
  requires_user: z.undefined(),
}).or(
  z.object({
    requires_user: z.string(),
  }),
);

export async function fetchApiShoppingCart(
  contactId: number,
  checkAuth = true,
): Promise<ApiResponse<{ cart: RetailStoreCart }>> {
  if (checkAuth) {
    const authorization = await authorize();

    if (!authorization.success) {
      return authorization;
    }
  }

  const response = await fetchSession(
    urlJoinP(env.NEXT_PUBLIC_CF_HOST, ["retail-store-controller"], {
      ajax: true,
      url_action: "get_shopping_cart_items",
      contact_id: contactId,
    }),
    {
      method: "GET",
      cache: "no-cache",
    },
  );

  const data = RetailStoreCartResponse.safeParse(await response.json());

  if (!data.success) {
    return {
      success: false,
      error: data.error.message,
    };
  }

  if (data.data.requires_user !== undefined) {
    return {
      success: false,
      error: "AUTH: RetailStoreController Authentication Failure",
    };
  }

  return {
    success: true,
    cart: data.data,
  };
}
