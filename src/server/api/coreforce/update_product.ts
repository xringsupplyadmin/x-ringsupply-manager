import { z } from "zod";
import { filterUndefined, makeApiRequest, parseApiResponse } from "./api_util";
import { type ProductChangeData } from "./types";

/**
 * Attempt to update a product
 *
 * @param productId The product ID to update
 * @param data The data to update the product with
 * @throws {Error} If the API returns an error
 */
export async function apiUpdateProduct(
  productId: number,
  data: ProductChangeData,
) {
  filterUndefined(data);

  const response = await makeApiRequest("import_product", undefined, {
    method: "POST",
    body: JSON.stringify({
      product_id: productId,
      ...data,
      source_code: "X_RING_SUPPLY_MANAGER",
    }),
  });

  const result = await parseApiResponse(
    response,
    z.object({
      product_id: z.number(),
    }),
  );

  return result.product_id;
}
