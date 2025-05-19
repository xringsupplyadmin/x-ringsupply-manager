import { urlJoinP } from "url-join-ts";
import { z } from "zod";
import { env } from "~/env";
import { fetchSession, CF_API_HEADER } from "~/lib/server_utils";

const LoginResponse = z.union([
  z.object({
    result: z.literal("ERROR"),
    error_message: z.string(),
  }),
  z.object({
    result: z.literal("OK"),
    user_id: z.number(),
    contact_id: z.number(),
    client_id: z.number(),
    session_identifier: z.string(),
  }),
]);

export async function checkAuthorized() {
  const check = await fetchSession(
    urlJoinP(env.NEXT_PUBLIC_CF_HOST, ["admin-menu"], {
      ajax: true,
    }),
    {
      method: "GET",
      cache: "no-cache",
      headers: CF_API_HEADER,
    },
  );

  try {
    // If JSON was returned, the user is not authorized
    await check.json(); // -> { "error_message": "..." }
    console.debug("[RetailStore] API user is not authorized");
    return false;
  } catch {
    // The response is the HTML of the admin menu, so the user is authorized
    console.debug("[RetailStore] API user is authorized");
    return true;
  }
}

export async function authorize() {
  const authorized = await checkAuthorized();

  if (authorized)
    return {
      success: true,
      skipped: true,
    };

  const credentials = new FormData();
  credentials.append("user_name", env.CF_USERNAME);
  credentials.append("password", env.CF_PASSWORD);

  const response = await fetchSession(
    urlJoinP(env.NEXT_PUBLIC_CF_HOST, ["api.php"], {
      method: "login",
    }),
    {
      method: "POST",
      cache: "no-cache",
      body: credentials,
      headers: CF_API_HEADER,
    },
  );

  const status = LoginResponse.safeParse(await response.json());
  if (!status.success) {
    throw new Error(
      "Authorization failed (Invalid Response): " + status.error.message,
    );
  }

  if (status.data.result === "OK") {
    console.debug("[RetailStore] Authorization successful");
    return {
      success: true,
      skipped: false,
    };
  } else {
    throw new Error("Authorization failed: " + status.data.error_message);
  }
}

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
    .transform((obj) => ({
      ...obj,
      link_name: urlJoinP(env.NEXT_PUBLIC_CF_HOST, ["product-details"], {
        id: obj.product_id,
      }),
    }))
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
