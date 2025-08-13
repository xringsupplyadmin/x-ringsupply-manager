import { z, type ZodTypeAny } from "zod";

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

export const CategoryResult = z.object({
  product_categories: z
    .object({
      product_category_id: z.number(),
      product_category_code: z.string(),
      description: z.string(),
    })
    .array(),
});

export const DepartmentResult = z.object({
  product_departments: z
    .object({
      product_department_id: z.number(),
      product_department_code: z.string(),
      description: z.string(),
      product_categories: z.number().array(),
    })
    .array(),
});

export const ManufacturerResult = z.object({
  product_manufacturers: z
    .object({
      contact_id: optApiNumber,
      product_manufacturer_id: z.number(),
      product_manufacturer_code: z.string(),
      description: z.string(),
      detailed_description: optApiString,
      meta_title: optApiString,
      meta_description: optApiString,
      link_name: optApiString,
      web_page: optApiString,
      image_id: optApiNumber,
      inactive: z.coerce.boolean(),
      deleted: z.coerce.boolean(),
    })
    .array(),
});

export const TagResult = z.object({
  product_tags: z
    .object({
      product_tag_id: z.number(),
      product_tag_code: z.string(),
      description: z.string(),
      detailed_description: optApiString,
      meta_description: optApiString,
      inactive: z.coerce.boolean(),
    })
    .array(),
});

export const LocationResult = z.object({
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

export const ProductResult = z.object({
  /* Data that can be modified */
  primary_product_id: z.number(),
  product_id: z.number(),
  product_code: z.string(),
  description: z.string(),
  detailed_description: optApiString.default(""),
  manufacturer_sku: optApiString,
  model: optApiString,
  upc_code: optApiString,
  link_name: optApiString,
  product_manufacturer_id: optApiNumber,
  product_category_ids: idListString, // product_category_codes
  product_tag_ids: idListString, // product_tag_codes
  base_cost: optApiNumberString,
  list_price: optApiNumberString,
  manufacturer_advertised_price: optApiNumberString,
  image_url: z.string().url().optional(), // image_id
  alternate_image_urls: z
    .object({
      url: z.string().url(),
    })
    .array(), // alternate_images
  /* Data used for display */
  image_id: optApiNumber,
  date_created: z.coerce.date(),
  time_changed: z.coerce.date(),
  sort_order: optApiNumber.default(100),
  manufacturer_image_id: optApiNumber,
});
export type ProductResult = z.infer<typeof ProductResult>;

export const ApiProduct = z.object({
  cfId: z.number(),
  code: z.string(),
  description: z.string(),
  detailedDescription: z.string().nullish(),
  manufacturerSku: z.string().nullish(),
  model: z.string().nullish(),
  upcCode: z.string().nullish(),
  linkName: z.string().nullish(),
  productManufacturerId: z.number().nullish(),
  productCategoryIds: z.array(z.number()),
  productTagIds: z.array(z.number()),
  baseCost: z.number().nullish(),
  listPrice: z.number().nullish(),
  manufacturerAdvertisedPrice: z.number().nullish(),
  imageUrls: z.array(z.string()),
  imageId: z.number().nullish(),
  dateCreated: z.date(),
  timeChanged: z.date(),
  sortOrder: z.number(),
  manufacturerImageId: z.number().nullish(),
});
export type ApiProduct = z.infer<typeof ApiProduct>;

export const ApiProductEditable = ApiProduct.pick({
  code: true,
  description: true,
  detailedDescription: true,
  manufacturerSku: true,
  model: true,
  upcCode: true,
  linkName: true,
  baseCost: true,
  listPrice: true,
  manufacturerAdvertisedPrice: true,
  sortOrder: true,
});
export type ApiProductEditable = z.infer<typeof ApiProductEditable>;

export const DbProduct = ApiProduct.extend({
  id: z.string(),
});
export type DbProduct = z.infer<typeof DbProduct>;

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

export type ProductChangeData = Partial<{
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
}> &
  ImageUrlsChangeData &
  LocationChangeData;
