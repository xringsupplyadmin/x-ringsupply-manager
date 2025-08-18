import { optNumber, optString, safeUrl } from "./cf-api";
import { urlJoin, urlJoinP } from "url-join-ts";
import { env } from "~/env";
import { z } from "zod/v4";

export const ProductIdentifier = z.union([
  z.object({ product_id: z.number() }),
  z.object({ product_code: z.string() }),
]);
export type ProductIdentifier = z.infer<typeof ProductIdentifier>;

export const ProductIdentifiers = z.union([
  z.object({ product_ids: z.number().array() }),
  z.object({ product_codes: z.string().array() }),
]);
export type ProductIdentifiers = z.infer<typeof ProductIdentifiers>;

export const ProductSearchIdentifier = z.union([
  z.object({ product_id: z.number() }),
  z.object({ product_code: z.string() }),
  z.object({ upc_code: z.string() }),
]);
export type ProductSearchIdentifier = z.infer<typeof ProductSearchIdentifier>;

export const ProductSearchIdentifiers = z.union([
  z.object({ product_ids: z.number().array() }),
  z.object({ product_codes: z.string().array() }),
  z.object({ upc_codes: z.string().array() }),
]);
export type ProductSearchIdentifiers = z.infer<typeof ProductSearchIdentifiers>;

/**
 * Transforms a product link name into an absolute URL.
 * @param relativeLinkName The relative link name for the product
 * @returns The absolute URL for the product, or undefined if the link name is empty.
 */
export function getProductAbsoluteLink(relativeLinkName?: string) {
  return relativeLinkName?.trim() === ""
    ? undefined
    : urlJoin(env.NEXT_PUBLIC_CF_HOST, "product", relativeLinkName);
}

/**
 * Transforms a product object to ensure the link_name is an absolute URL.
 * @param product The product to transform
 * @returns A copy of the product with an absolute link_name.
 */
export function defaultAbsoluteLinkName<
  Product extends { product_id: number; link_name?: string },
>(product: Product) {
  return {
    ...product,
    link_name:
      getProductAbsoluteLink(product.link_name) ??
      urlJoinP(env.NEXT_PUBLIC_CF_HOST, ["product-details"], {
        id: product.product_id,
      }),
  };
}

export const productImageUrl = safeUrl(
  "https://placehold.co/600/jpg?text=Image+Not+Found",
);

export const ProductExtraInformation = z.object({
  // api contains duplicates for some reason so we need to make a set to filter them out
  restricted_states: optString.transform((restrictions) =>
    restrictions ? [...new Set(restrictions.split(","))] : [],
  ),
  product_facets: optString.transform((facets) =>
    facets
      ? Object.fromEntries(
          facets
            .split("||||")
            .map((facet): [string, string] | undefined => {
              const [one, two] = facet.split("||");
              if (!one || !two) return undefined; // invalid facet
              return [one, two];
            })
            .filter((facet) => !!facet), // strip invalid facets
        )
      : {},
  ),
  product_manufacturer_code: optString,
  product_category_codes: optString.transform((codes) => codes?.split(",")),
  product_tag_codes: optString.transform((codes) => codes?.split(",")),
});
export type ProductExtraInformation = z.infer<typeof ProductExtraInformation>;

export const ProductFacet = z.object({
  product_facet_id: z.number(),
  description: z.string(),
  facet_value: z.string(),
});
export type ProductFacet = z.infer<typeof ProductFacet>;

export const ProductTag = z.object({
  product_tag_id: z.number(),
  description: z.string(),
});
export type ProductTag = z.infer<typeof ProductTag>;

export const CoreforceProduct = z
  .object({
    product_id: z.number(),
    product_code: z.string(),
    description: z.string(),
    detailed_description: z.string(),
    link_name: optString,
    product_manufacturer_id: optNumber,
    base_cost: z.coerce.number(),
    list_price: z.coerce.number(),
    image_id: optNumber,
    upc_code: optString,
    manufacturer_sku: optString,
    image_url: productImageUrl,
    small_image_url: productImageUrl,
    thumbnail_image_url: productImageUrl,
    alternate_image_urls: z.array(
      z
        .object({
          url: productImageUrl,
        })
        .transform(({ url }) => url),
    ),
    product_facets: ProductFacet.array(),
    product_tags: ProductTag.array(),
  })
  .transform((o) => ({
    ...o,
    image_urls: [o.image_url, ...o.alternate_image_urls],
  }));
export type CoreforceProduct = z.infer<typeof CoreforceProduct>;

export const CoreforceProductTaxonomy = z
  .object({
    product_categories: z.array(
      z.object({
        product_id: z.number(),
        product_code: z.string(),
        product_categories: z.record(z.string(), z.string()),
      }),
    ),
  })
  .transform((o) => o.product_categories);
export type CoreforceProductTaxonomy = z.infer<typeof CoreforceProductTaxonomy>;
