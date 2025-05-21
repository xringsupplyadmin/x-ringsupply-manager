import { z } from "zod";
import { makeApiRequest, parseApiResponse } from "../../coreforce/api_util";
import { CoreforceProduct, CoreforceProductTaxonomy } from "../types/coreforce";

export async function getTaxonomy(productIds: number[]) {
  const response = await makeApiRequest("get_product_taxonomy", {
    product_ids: productIds.join(","),
  });

  const result = await parseApiResponse(response, CoreforceProductTaxonomy);

  const ret: { [productId: number]: string[] } = {};

  for (const product of result) {
    ret[product.product_id] = Object.values(product.product_categories);
  }

  return ret;
}

export async function getProduct(productId: number) {
  const response = await makeApiRequest("get_product", {
    product_id: productId,
  });

  const result = await parseApiResponse(
    response,
    z
      .object({
        results: CoreforceProduct.array(),
      })
      .transform((o) => o.results),
  );

  if (result.length === 0) {
    return null;
  } else {
    return result[0]!;
  }
}
