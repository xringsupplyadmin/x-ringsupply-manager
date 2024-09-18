import { z, type ZodTypeAny } from "zod";
import { makeApiRequest, parseApiResponse } from "~/lib/server_utils";

const CategoryResult = z.object({
  product_categories: z
    .object({
      product_category_id: z.number(),
      product_category_code: z.string(),
      description: z.string(),
    })
    .array(),
});

const DepartmentResult = z.object({
  product_departments: z
    .object({
      product_department_id: z.number(),
      product_department_code: z.string(),
      description: z.string(),
      product_categories: z.number().array(),
    })
    .array(),
});

const ManufacturerResult = z.object({
  product_manufacturers: z
    .object({
      product_manufacturer_id: z.number(),
      product_manufacturer_code: z.string(),
      description: z.string(),
      detailed_description: z.string().optional(),
      meta_description: z.string().optional(),
      image_id: z.number().optional(),
      inactive: z.coerce.boolean(),
    })
    .array(),
});

const TagResult = z.object({
  product_tags: z
    .object({
      product_tag_id: z.number(),
      product_tag_code: z.string(),
      description: z.string(),
      detailed_description: z.string().optional(),
      meta_description: z.string().optional(),
      inactive: z.coerce.boolean(),
    })
    .array(),
});

const LocationResult = z.object({
  locations: z
    .object({
      location_id: z.number(),
      location_code: z.string(),
      description: z.string(),
      internal_use_only: z.coerce.boolean(),
      inactive: z.coerce.boolean(),
    })
    .array(),
});

export async function getCategories() {
  const response = await makeApiRequest("get_product_categories");
  return (
    await parseApiResponse(response, CategoryResult)
  ).product_categories.map((category) => ({
    cfId: category.product_category_id,
    code: category.product_category_code,
    description: category.description,
  }));
}

export async function getDepartments() {
  const response = await makeApiRequest("get_product_departments");
  return (
    await parseApiResponse(response, DepartmentResult)
  ).product_departments.map((department) => ({
    cfId: department.product_department_id,
    code: department.product_department_code,
    description: department.description,
    categories: department.product_categories,
  }));
}

export async function getManufacturers() {
  const response = await makeApiRequest("get_product_manufacturers");
  return (
    await parseApiResponse(response, ManufacturerResult)
  ).product_manufacturers.map((manufacturer) => ({
    cfId: manufacturer.product_manufacturer_id,
    code: manufacturer.product_manufacturer_code,
    description: manufacturer.description,
    detailedDescription: manufacturer.detailed_description,
    metaDescription: manufacturer.meta_description,
    imageId: manufacturer.image_id,
    inactive: manufacturer.inactive,
  }));
}

export async function getTags() {
  const response = await makeApiRequest("get_product_tags");
  return (await parseApiResponse(response, TagResult)).product_tags.map(
    (tag) => ({
      cfId: tag.product_tag_id,
      code: tag.product_tag_code,
      description: tag.description,
      detailedDescription: tag.detailed_description,
      metaDescription: tag.meta_description,
      inactive: tag.inactive,
    }),
  );
}

export async function getLocations() {
  const response = await makeApiRequest("get_locations");
  return (await parseApiResponse(response, LocationResult)).locations.map(
    (location) => ({
      cfId: location.location_id,
      code: location.location_code,
      description: location.description,
      internalUse: location.internal_use_only,
      inactive: location.inactive,
    }),
  );
}

const undefineEmpty = <Type extends ZodTypeAny>(type: Type) =>
  z.preprocess((val) => {
    if (val === "") {
      return undefined;
    } else {
      return val;
    }
  }, type.optional());
const optApiNumber = undefineEmpty(z.number());
const optApiNumberString = undefineEmpty(z.coerce.number());
const optApiString = undefineEmpty(z.string());
const idListString = z.string().transform((val) => val.split(",").map(Number));

export const ProductResult = z.object({
  /* Data that can be modified */
  primary_product_id: z.number(),
  product_id: z.number(),
  product_code: z.string(),
  description: z.string(),
  detailed_description: optApiString,
  manufacturer_sku: optApiString,
  model: optApiString,
  upc_code: optApiString,
  link_name: optApiString,
  product_manufacturer_id: optApiNumber,
  product_category_ids: idListString,
  product_tag_ids: idListString,
  base_cost: optApiNumberString,
  list_price: optApiNumberString,
  manufacturer_advertised_price: optApiNumberString,
  image_url: z.string().url().optional(),
  alternate_image_urls: z
    .object({
      url: z.string().url(),
    })
    .array(),
  /* Data used for display */
  image_id: optApiNumber,
  date_created: z.coerce.date(),
  time_changed: z.coerce.date(),
  sort_order: optApiNumber.default(100),
  manufacturer_image_id: optApiNumber,
});
export type ProductResult = z.infer<typeof ProductResult>;

function getArrayQueryString(array?: number[]) {
  return array ? array.join("|") : undefined;
}

/**
 * Search for products
 *
 * @throws {Error} If the API returns an error
 */
export async function searchProducts(
  query?: {
    searchText?: string;
    productId?: number;
  },
  options?: {
    limit?: number;
    offset?: number;
  },
  filter?: {
    categories?: number[];
    departments?: number[];
    manufacturers?: number[];
    tags?: number[];
    locations?: number[];
    out_of_stock?: boolean;
  },
  exclude?: {
    categories?: number[];
    departments?: number[];
    manufacturers?: number[];
  },
) {
  const limit = options?.limit ?? 50;
  const response = await makeApiRequest("search_products", {
    /* Query */
    search_text: query?.searchText,
    product_id: query?.productId,
    /* Options */
    show_out_of_stock: filter?.out_of_stock ? "1" : undefined,
    limit: limit,
    offset: options?.offset ?? 0,
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
  });

  const result = await parseApiResponse(
    response,
    z.object({
      results: ProductResult.array(),
      result_count: z.number(),
    }),
  );

  return {
    products: result.results,
    hasNextPage: result.result_count < limit ? false : true,
  };
}

type ImageUrlsChangeData =
  | {
      /** A list of image URLs to set */
      image_urls: string[];
      /** Whether to replace existing images */
      replace_existing_images: boolean;
    }
  | {
      image_urls?: never;
      replace_existing_images?: never;
    };

type LocationChangeData =
  | {
      /**The location ID to update */
      location_id: number;
      /** The quantity to set */
      quantity?: number;
      /** Action unknown */
      total_cost?: number;
      /** Action unknown */
      product_price?: number;
    }
  | {
      location_id?: never;
      quantity?: never;
      total_cost?: never;
      product_price?: never;
    };

export type ProductChangeData = {
  /** Required product code (index) */
  product_code: string;

  /* Product Details */
  description?: string;
  detailed_description?: string;
  manufacturer_sku?: string;
  model?: string;
  upc_code?: string;

  /* Taxonomy */
  link_name?: string;
  product_manufacturer_id?: number;
  product_category_ids?: number[];
  product_tags?: string[];

  /* Pricing */
  base_cost?: number;
  list_price?: number;
  manufacturer_advertised_price?: number;

  /** Location specific details for the product */
  location_quantities?: {
    /** The location id */
    location_id: number;
    /** The cost of all inventory for the location */
    total_cost?: number;
    /** The sale price for the location */
    sale_price?: number;
    /** The quantity available for the location */
    quantity?: number;
  }[];
} & ImageUrlsChangeData &
  LocationChangeData;

/**
 * Attempt to update a product
 *
 * @param productId The product ID to update
 * @param data The data to update the product with
 * @throws {Error} If the API returns an error
 */
export async function updateProduct(
  productId: number,
  data: ProductChangeData,
) {
  const response = await makeApiRequest("import_product", undefined, {
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
