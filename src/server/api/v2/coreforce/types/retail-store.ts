import { z } from "zod/v4";
import { defaultAbsoluteLinkName, productImageUrl } from "./products";

const formattedNumber = z.preprocess(
  (num) =>
    typeof num === "string"
      ? Number(num.replaceAll(",", ""))
      : z.coerce.number().parse(num),
  z.number(),
);
/**
 * The response from the CF "API" for the cart items
 *
 * Why is this not a normal API method?
 * Because CF is a piece of sh*t (pardon the french)
 */
export const RetailStoreCart = z.object({
  shopping_cart_items: z
    .object({
      shopping_cart_item_id: z.number(),
      shopping_cart_id: z.number(),
      product_id: z.number(),
      description: z.string(),
      time_submitted: z.coerce.date(),
      quantity: z.number(),
      unit_price: formattedNumber,
      list_price: formattedNumber,
      small_image_url: productImageUrl,
      image_url: productImageUrl,
    })
    .transform(defaultAbsoluteLinkName)
    .array(),
});
export type RetailStoreCart = z.infer<typeof RetailStoreCart>;
