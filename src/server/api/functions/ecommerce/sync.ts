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
      await step.run(`update-category-${category.cfId}`, async () => {
        await e
          .insert(e.products.Category, category)
          .unlessConflict((record) => ({
            on: record.cfId,
            else: e.update(record, () => ({
              set: category,
            })),
          }))
          .run(client);
      });
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
      await step.run(`update-department-${department.cfId}`, async () => {
        const departmentData = {
          ...department,
          categories: e.select(e.products.Category, (c) => ({
            filter: e.op(c.cfId, "in", e.set(...department.categories)),
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
      });
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
      await step.run(`update-manufacturer-${manufacturer.cfId}`, async () => {
        await e
          .insert(e.products.Manufacturer, manufacturer)
          .unlessConflict((record) => ({
            on: record.cfId,
            else: e.update(record, () => ({
              set: manufacturer,
            })),
          }))
          .run(client);
      });
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
      await step.run(`update-tag-${tag.cfId}`, async () => {
        await e
          .insert(e.products.Tag, tag)
          .unlessConflict((record) => ({
            on: record.cfId,
            else: e.update(record, () => ({
              set: tag,
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
      await step.run(`update-location-${location.cfId}`, async () => {
        await e
          .insert(e.products.Location, location)
          .unlessConflict((record) => ({
            on: record.cfId,
            else: e.update(record, () => ({
              set: location,
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
