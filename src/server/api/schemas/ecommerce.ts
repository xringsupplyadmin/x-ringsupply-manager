import { type LiteralZodEventSchema } from "inngest";
import { z } from "zod";
import { ProductResult } from "../functions/ecommerce/cf_api";

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

const importProducts = z.object({
  name: z.literal("ecommerce/import/products"),
  data: z.object({
    products: ProductResult.array(),
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
