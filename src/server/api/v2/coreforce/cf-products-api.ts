import { z } from "zod/v4";
import {
  filterUndefined,
  getArrayQueryString,
  makeApiRequest,
  parseApiResponse,
} from "./cf-api-util";
import {
  CoreforceProduct,
  CoreforceProductTaxonomy,
  ProductExtraInformation,
  type ProductIdentifier,
  type ProductIdentifiers,
  type ProductSearchIdentifier,
  type ProductSearchIdentifiers,
} from "./types/products";

export async function getProduct(identifier: ProductSearchIdentifier) {
  const response = await makeApiRequest("get_product", identifier);

  return await parseApiResponse(
    response,
    z
      .object({
        results: CoreforceProduct.array(),
      })
      .transform((o) => (o.results.length === 0 ? null : o.results[0]!)),
  );
}

export async function getProducts(identifiers: ProductSearchIdentifiers) {
  if (
    ("product_ids" in identifiers && identifiers.product_ids.length === 0) ||
    ("product_codes" in identifiers &&
      identifiers.product_codes.length === 0) ||
    ("upc_codes" in identifiers && identifiers.upc_codes.length === 0)
  )
    return [];

  const response = await makeApiRequest("get_product", identifiers);

  return await parseApiResponse(
    response,
    z
      .object({
        results: CoreforceProduct.array(),
        result_count: z.number(),
      })
      .transform((o) => o.results),
  );
}

export async function getProductExtraInformation(
  identifier: ProductIdentifier,
) {
  const response = await makeApiRequest("get_product_information", identifier);

  const result = await parseApiResponse(
    response,
    z.object(
      {
        product_information: ProductExtraInformation,
      },
      {
        error: "Product not found",
      },
    ),
  );

  return result.product_information;
}

/**
 * Search for products
 */
export async function searchProducts(
  query?: {
    searchText?: string;
    productId?: number;
  },
  pageData?: {
    limit?: number;
    offset?: number;
  },
  filter?: {
    categories?: number[];
    departments?: number[];
    manufacturers?: number[];
    tags?: number[];
    locations?: number[];
    hideOutOfStock?: boolean;
  },
  exclude?: {
    categories?: number[];
    departments?: number[];
    manufacturers?: number[];
  },
) {
  const limit = pageData?.limit ?? 60;
  const offset = pageData?.offset ?? 0;
  const payload = {
    /* Query */
    search_text: query?.searchText,
    product_id: query?.productId,
    /* Options */
    show_out_of_stock: filter?.hideOutOfStock ? "0" : undefined,
    limit: limit,
    offset: offset,
    /* Excludes */
    exclude_product_category_ids: getArrayQueryString(exclude?.categories),
    exclude_product_department_ids: getArrayQueryString(exclude?.departments),
    exclude_product_manufacturer_ids: getArrayQueryString(
      exclude?.manufacturers,
    ),
    /* Filters */
    product_category_ids: getArrayQueryString(filter?.categories),
    product_department_ids: getArrayQueryString(filter?.departments),
    product_manufacturer_ids: getArrayQueryString(filter?.manufacturers),
    product_tag_ids: getArrayQueryString(filter?.tags),
    location_ids: getArrayQueryString(filter?.locations),
  };

  filterUndefined(payload);

  const response = await makeApiRequest("search_products", payload);

  const result = await parseApiResponse(
    response,
    z.object({
      results: CoreforceProduct.array(),
      result_count: z.number(),
    }),
  );

  return {
    data: result.results,
    hasNextPage: result.result_count === limit + offset,
    queryItemCount: result.result_count,
  };
}

export async function getTaxonomy(identifiers: ProductIdentifiers) {
  const response = await makeApiRequest("get_product_taxonomy", identifiers);

  const result = await parseApiResponse(response, CoreforceProductTaxonomy);

  const ret: { [productId: number]: string[] } = {};

  for (const product of result) {
    ret[product.product_id] = Object.values(product.product_categories);
  }

  return ret;
}
