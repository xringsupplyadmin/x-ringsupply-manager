import client from "~/server/db/client";
import { inngest } from "../../inngest";
import logInngestError from "../emails/error_handling";
import {
  apiGetCategories,
  apiGetDepartments,
  apiGetLocations,
  apiGetManufacturers,
  apiGetTags,
} from "../../coreforce/taxonomy";
import e from "@/dbschema/edgeql-js";

const syncAll = inngest.createFunction(
  {
    id: "syncAll",
    name: "Sync All",
    onFailure: logInngestError,
  },
  { event: "ecommerce/sync/all" },
  async ({ step }) => {
    const categories = await step.invoke("sync-categories", {
      function: syncCategories,
      data: {},
    });
    const departments = await step.invoke("sync-departments", {
      function: syncDepartments,
      data: {},
    });
    const manufacturers = await step.invoke("sync-manufacturers", {
      function: syncManufacturers,
      data: {},
    });
    const tags = await step.invoke("sync-tags", {
      function: syncTags,
      data: {},
    });
    const locations = await step.invoke("sync-locations", {
      function: syncLocations,
      data: {},
    });

    return {
      categories: categories.count,
      departments: departments.count,
      manufacturers: manufacturers.count,
      tags: tags.count,
      locations: locations.count,
    };
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
      return await apiGetCategories();
    });

    await step.run(`update-database`, async () => {
      await client.transaction(async (tx) => {
        for (const category of categories) {
          await e
            .insert(e.ecommerce.Category, category)
            .unlessConflict((record) => ({
              on: record.cfId,
              else: e.update(record, () => ({
                set: category,
              })),
            }))
            .run(tx);
        }
      });
    });

    return {
      count: categories.length,
    };
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
      return await apiGetDepartments();
    });

    await step.run(`update-database`, async () => {
      await client.transaction(async (tx) => {
        for (const department of departments) {
          const categories =
            department.categories.length > 0
              ? e.select(e.ecommerce.Category, (c) => ({
                  filter: e.op(c.cfId, "in", e.set(...department.categories)),
                }))
              : e.set();
          const departmentData = {
            ...department,
            categories: categories,
          };

          await e
            .insert(e.ecommerce.Department, departmentData)
            .unlessConflict((record) => ({
              on: record.cfId,
              else: e.update(record, () => ({
                set: departmentData,
              })),
            }))
            .run(tx);
        }
      });
    });

    return {
      count: departments.length,
    };
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
      return await apiGetManufacturers();
    });

    await step.run(`update-database`, async () => {
      await client.transaction(async (tx) => {
        for (const manufacturer of manufacturers) {
          await e
            .insert(e.ecommerce.Manufacturer, manufacturer)
            .unlessConflict((record) => ({
              on: record.cfId,
              else: e.update(record, () => ({
                set: manufacturer,
              })),
            }))
            .run(tx);
        }
      });
    });

    return {
      count: manufacturers.length,
    };
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
      return await apiGetTags();
    });

    await step.run(`update-database`, async () => {
      await client.transaction(async (tx) => {
        for (const tag of tags) {
          await e
            .insert(e.ecommerce.Tag, tag)
            .unlessConflict((record) => ({
              on: record.cfId,
              else: e.update(record, () => ({
                set: tag,
              })),
            }))
            .run(tx);
        }
      });
    });

    return {
      count: tags.length,
    };
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
      return await apiGetLocations();
    });

    await step.run(`update-database`, async () => {
      await client.transaction(async (tx) => {
        for (const location of locations) {
          await e
            .insert(e.ecommerce.Location, location)
            .unlessConflict((record) => ({
              on: record.cfId,
              else: e.update(record, () => ({
                set: location,
              })),
            }))
            .run(tx);
        }
      });
    });

    return {
      count: locations.length,
    };
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
