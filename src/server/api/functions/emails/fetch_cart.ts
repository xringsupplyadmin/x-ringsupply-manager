import { urlJoinP } from "url-join-ts";
import { z } from "zod";
import { env } from "~/env";
import { fetchSession } from "~/lib/server_utils";
import { inngest } from "../../inngest";
import { authorizeApi } from "./api_authorization";
import logInngestError from "./error_handling";

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
 * The response from the CF "API" for the cart items
 *
 * Why is this not a normal API method?
 * Because CF is a piece of sh*t (pardon the french)
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
      unit_price: formattedNumber,
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

export const fetchApiCart = inngest.createFunction(
  {
    id: "fetchApiCart",
    name: "Fetch Retail Store Cart",
    onFailure: logInngestError,
  },
  {
    event: "api/fetch.cart",
  },
  async ({ event, step }) => {
    await step.invoke("authorize-api", {
      function: authorizeApi,
    });

    const response = await fetchSession(
      urlJoinP(env.NEXT_PUBLIC_CF_HOST, ["retail-store-controller"], {
        ajax: true,
        url_action: "get_shopping_cart_items",
        contact_id: event.data.cfContactId,
      }),
      {
        method: "GET",
        cache: "no-cache",
      },
    );

    const responseData = RetailStoreCartResponse.safeParse(
      await response.json(),
    );

    if (!responseData.success) {
      throw new Error(responseData.error.message);
    }

    if (responseData.data.requires_user !== undefined) {
      throw new Error("AUTH: RetailStoreController Authentication Rejected");
    }

    return responseData.data.shopping_cart_items;
  },
);
