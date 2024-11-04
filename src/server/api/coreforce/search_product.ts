import { z } from "zod";
import {
  getArrayQueryString,
  makeApiRequest,
  parseApiResponse,
} from "./api_util";
import { ProductResult } from "./types";

export const ProductIdentifier = z.union([
  z.object({ product_id: z.number() }),
  z.object({ product_code: z.string() }),
  z.object({ upc_code: z.string() }),
]);
export type ProductIdentifier = z.infer<typeof ProductIdentifier>;

/**
 * Get a product
 *
 * @throws {Error} If the API returns an error
 */
export async function apiGetProduct(identifier: ProductIdentifier) {
  const response = await makeApiRequest("search_products", identifier);

  const result = await parseApiResponse(
    response,
    z.object({
      results: ProductResult.array(),
      result_count: z.number(),
    }),
  );

  if (result.results.length === 0) {
    return null;
  } else if (result.results.length > 1) {
    throw new Error("Multiple products found");
  } else {
    return mapApiProduct(result.results[0]!);
  }
}

/**
 * Search for products
 *
 * @throws {Error} If the API returns an error
 */
export async function apiSearchProducts(
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

  // Filter out empty values
  for (const key in payload) {
    // type stuff
    const index = key as keyof typeof payload;
    if (
      payload[index] === undefined ||
      payload[index] === "" ||
      payload[index] === null
    ) {
      delete payload[index];
    }
  }

  const response = await makeApiRequest("search_products", payload);

  const result = await parseApiResponse(
    response,
    z.object({
      results: ProductResult.array(),
      result_count: z.number(),
    }),
  );

  return {
    data: result.results.map(mapApiProduct),
    hasNextPage: result.result_count === limit + offset,
    queryItemCount: result.result_count,
  };
}

function mapApiProduct(product: ProductResult) {
  if (product.primary_product_id !== product.product_id) {
    console.warn(
      "Primary product ID does not match product ID",
      product.primary_product_id,
      product.product_id,
      product.product_code,
    );
  }

  const alternateImageUrls = product.alternate_image_urls.map(
    (urlData) => urlData.url,
  );

  return {
    cfId: product.product_id,
    code: product.product_code,
    description: product.description,
    detailedDescription: product.detailed_description,
    manufacturerSku: product.manufacturer_sku,
    model: product.model,
    upcCode: product.upc_code,
    linkName: product.link_name,
    productManufacturerId: product.product_manufacturer_id,
    productCategoryIds: product.product_category_ids,
    productTagIds: product.product_tag_ids,
    baseCost: product.base_cost,
    listPrice: product.list_price,
    manufacturerAdvertisedPrice: product.manufacturer_advertised_price,
    imageUrls: product.image_url
      ? [product.image_url, ...alternateImageUrls]
      : alternateImageUrls,
    imageId: product.image_id,
    dateCreated: product.date_created,
    timeChanged: product.time_changed,
    sortOrder: product.sort_order,
    manufacturerImageId: product.manufacturer_image_id,
  };
}
