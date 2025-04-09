import { urlJoinP } from "url-join-ts";
import { z, type ZodObject, type ZodRawShape } from "zod";
import { env } from "~/env";
import { CF_API_HEADER } from "~/lib/server_utils";
import type { ApiProduct, ProductChangeData } from "./types";

/**
 * Remove all undefined, null, or blank values from an object
 *
 * Mutates in place
 *
 * @param obj The object to filter
 * @return The same object for convenience
 */
export function filterUndefined<T extends object>(obj: T) {
  // Filter out empty values
  for (const key in obj) {
    // type stuff
    const index = key as keyof typeof obj;
    if (obj[index] === undefined || obj[index] === "" || obj[index] === null) {
      delete obj[index];
    }
  }

  return obj; // for convenience
}

const ApiResponse = z
  .object({
    result: z.literal("OK"),
  })
  .or(z.object({ result: z.literal("ERROR"), error_message: z.string() }));

export async function makeApiRequest(
  action: string,
  params?: object,
  init?: RequestInit,
) {
  const url = urlJoinP(env.NEXT_PUBLIC_CF_HOST, ["api.php"], {
    method: action,
    ...params,
  });
  console.debug(url);
  return await fetch(url, {
    ...init,
    headers: {
      ...CF_API_HEADER,
      ...init?.headers,
    },
  });
}

/**
 * Parse the response from the CF API into the expected data
 *
 * @param response The response from the CF API
 * @param parser The Zod parser to extract the data
 * @returns The parsed data
 * @throws {Error} If the response is not valid or an API error occurred
 */

export async function parseApiResponse<
  Shape extends ZodRawShape,
  Parser extends ZodObject<Shape>,
>(response: Response, parser: Parser) {
  const json = await response.json();

  const apiResponse = ApiResponse.safeParse(json);

  if (apiResponse.success) {
    if (apiResponse.data.result !== "OK") {
      throw new Error("API Error: " + apiResponse.data.error_message);
    }
    return parser.parse(json) as z.infer<Parser>;
  } else {
    throw new Error("Invalid API Response: " + apiResponse.error.message);
  }
}

export function getArrayQueryString(array?: number[]) {
  return array ? array.join(",") : undefined;
}

export function getProductChangeData(product: ApiProduct): ProductChangeData {
  return filterUndefined({
    product_code: product.code,
    description: product.description,
    detailed_description: product.detailedDescription ?? undefined,
    manufacturer_sku: product.manufacturerSku ?? undefined,
    model: product.model ?? undefined,
    upc_code: product.upcCode ?? undefined,
    link_name: product.linkName ?? undefined,
    product_manufacturer_id: product.productManufacturerId ?? undefined,
    // product_category_ids: product.productCategoryIds ?? undefined,
    // product_tags: product.product
    base_cost: product.baseCost ?? undefined,
    list_price: product.listPrice ?? undefined,
    manufacturer_advertised_price:
      product.manufacturerAdvertisedPrice ?? undefined,
  });
}
