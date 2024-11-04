import { type LiteralZodEventSchema } from "inngest";
import { z } from "zod";

const syncCategories = z.object({
  name: z.literal("ecommerce/sync/categories"),
  data: z.object({}),
}) satisfies LiteralZodEventSchema;

const syncDepartments = z.object({
  name: z.literal("ecommerce/sync/departments"),
  data: z.object({}),
}) satisfies LiteralZodEventSchema;

const syncManufacturers = z.object({
  name: z.literal("ecommerce/sync/manufacturers"),
  data: z.object({}),
}) satisfies LiteralZodEventSchema;

const syncTags = z.object({
  name: z.literal("ecommerce/sync/tags"),
  data: z.object({}),
}) satisfies LiteralZodEventSchema;

const syncLocations = z.object({
  name: z.literal("ecommerce/sync/locations"),
  data: z.object({}),
}) satisfies LiteralZodEventSchema;

const syncAll = z.object({
  name: z.literal("ecommerce/sync/all"),
  data: z.object({}),
}) satisfies LiteralZodEventSchema;

export const ImportProduct = z.object({
  /* Data that can be modified */
  cfId: z.number(),
  code: z.string(),
  description: z.string(),
  detailedDescription: z.string().optional(),
  manufacturerSku: z.string().optional(),
  model: z.string().optional(),
  upcCode: z.string().optional(),
  linkName: z.string().optional(),
  productManufacturerId: z.number().optional(),
  productCategoryIds: z.number().array(),
  productTagIds: z.number().array(),
  baseCost: z.number().optional(),
  listPrice: z.number().optional(),
  manufacturerAdvertisedPrice: z.number().optional(),
  imageUrls: z.string().url().array(),
  /* Data used for display */
  imageId: z.number().optional(),
  dateCreated: z.coerce.date(),
  timeChanged: z.coerce.date(),
  sortOrder: z.number(),
  manufacturerImageId: z.number().optional(),
});

const importProducts = z.object({
  name: z.literal("ecommerce/import/products"),
  data: z.object({
    products: ImportProduct.array(),
  }),
}) satisfies LiteralZodEventSchema;

const schema = [
  syncCategories,
  syncDepartments,
  syncManufacturers,
  syncTags,
  syncLocations,
  syncAll,
  importProducts,
];
export default schema;
