import client from "~/server/db/client";
import { inngest } from "../../inngest";
import logInngestError from "../emails/error_handling";
import {
  getCategories,
  getDepartments,
  getLocations,
  getManufacturers,
  getTags,
} from "./cf_api";
import e from "@/dbschema/edgeql-js";

const syncAll = inngest.createFunction(
  {
    id: "syncAll",
    name: "Sync All",
    onFailure: logInngestError,
  },
  { event: "ecommerce/sync/all" },
  async ({ step }) => {
    await step.invoke("sync-categories", {
      function: syncCategories,
      data: {},
    });
    await step.invoke("sync-departments", {
      function: syncDepartments,
      data: {},
    });
    await step.invoke("sync-manufacturers", {
      function: syncManufacturers,
      data: {},
    });
    await step.invoke("sync-tags", {
      function: syncTags,
      data: {},
    });
    await step.invoke("sync-locations", {
      function: syncLocations,
      data: {},
    });
  },
);

const syncCategories = inngest.createFunction(
  {
    id: "syncCategories",
    name: "Sync Categories",
    onFailure: logInngestError,
  },
  { event: "ecommerce/sync/categories" },
  async ({ step }) => {
    const categories = await step.run("get-categories", async () => {
      return await getCategories();
    });

    for (const category of categories) {
      await step.run(
        `update-category-${category.product_category_id}`,
        async () => {
          const categoryData = {
            cfId: category.product_category_id,
            code: category.product_category_code,
            description: category.description,
          };

          await e
            .insert(e.products.Category, categoryData)
            .unlessConflict((record) => ({
              on: record.cfId,
              else: e.update(record, () => ({
                set: categoryData,
              })),
            }))
            .run(client);
        },
      );
    }
  },
);

const syncDepartments = inngest.createFunction(
  {
    id: "syncDepartments",
    name: "Sync Departments",
    onFailure: logInngestError,
  },
  { event: "ecommerce/sync/departments" },
  async ({ step }) => {
    const departments = await step.run("get-departments", async () => {
      return await getDepartments();
    });

    for (const department of departments) {
      await step.run(
        `update-department-${department.product_department_id}`,
        async () => {
          const departmentData = {
            cfId: department.product_department_id,
            code: department.product_department_code,
            description: department.description,
            categories: e.select(e.products.Category, (c) => ({
              filter: e.op(
                c.cfId,
                "in",
                e.set(...department.product_categories),
              ),
            })),
          };

          await e
            .insert(e.products.Department, departmentData)
            .unlessConflict((record) => ({
              on: record.cfId,
              else: e.update(record, () => ({
                set: departmentData,
              })),
            }))
            .run(client);
        },
      );
    }
  },
);

const syncManufacturers = inngest.createFunction(
  {
    id: "syncManufacturers",
    name: "Sync Manufacturers",
    onFailure: logInngestError,
  },
  { event: "ecommerce/sync/manufacturers" },
  async ({ step }) => {
    const manufacturers = await step.run("get-manufacturers", async () => {
      return await getManufacturers();
    });

    for (const manufacturer of manufacturers) {
      await step.run(
        `update-manufacturer-${manufacturer.product_manufacturer_id}`,
        async () => {
          const manufacturerData = {
            cfId: manufacturer.product_manufacturer_id,
            code: manufacturer.product_manufacturer_code,
            description: manufacturer.description,
            detailedDescription: manufacturer.detailed_description,
            metaDescription: manufacturer.meta_description,
            imageId: manufacturer.image_id,
            inactive: manufacturer.inactive,
          };

          await e
            .insert(e.products.Manufacturer, manufacturerData)
            .unlessConflict((record) => ({
              on: record.cfId,
              else: e.update(record, () => ({
                set: manufacturerData,
              })),
            }))
            .run(client);
        },
      );
    }
  },
);

const syncTags = inngest.createFunction(
  {
    id: "syncTags",
    name: "Sync Tags",
    onFailure: logInngestError,
  },
  { event: "ecommerce/sync/tags" },
  async ({ step }) => {
    const tags = await step.run("get-tags", async () => {
      return await getTags();
    });

    for (const tag of tags) {
      await step.run(`update-tag-${tag.product_tag_id}`, async () => {
        const tagData = {
          cfId: tag.product_tag_id,
          code: tag.product_tag_code,
          description: tag.description,
          detailedDescription: tag.detailed_description,
          metaDescription: tag.meta_description,
          inactive: tag.inactive,
        };

        await e
          .insert(e.products.Tag, tagData)
          .unlessConflict((record) => ({
            on: record.cfId,
            else: e.update(record, () => ({
              set: tagData,
            })),
          }))
          .run(client);
      });
    }
  },
);

const syncLocations = inngest.createFunction(
  {
    id: "syncLocations",
    name: "Sync Locations",
    onFailure: logInngestError,
  },
  { event: "ecommerce/sync/locations" },
  async ({ step }) => {
    const locations = await step.run("get-locations", async () => {
      return await getLocations();
    });

    for (const location of locations) {
      await step.run(`update-location-${location.location_id}`, async () => {
        const locationData = {
          cfId: location.location_id,
          code: location.location_code,
          description: location.description,
          internalUse: location.internal_use_only,
          inactive: location.inactive,
        };

        await e
          .insert(e.products.Location, locationData)
          .unlessConflict((record) => ({
            on: record.cfId,
            else: e.update(record, () => ({
              set: locationData,
            })),
          }))
          .run(client);
      });
    }
  },
);

const functions = [
  syncAll,
  syncCategories,
  syncDepartments,
  syncManufacturers,
  syncTags,
  syncLocations,
];
export default functions;
