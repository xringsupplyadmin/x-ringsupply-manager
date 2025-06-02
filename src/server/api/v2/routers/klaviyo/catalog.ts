import e from "@/dbschema/edgeql-js";
import { createTRPCRouter } from "~/server/api/trpc";
import client from "~/server/db/client";
import {
  createCategories,
  deleteCategories,
  getCategories,
  updateCategories,
} from "../../klaviyo/catalog/categories";
import { klaviyoProcedure } from "../procedures";

export const klaviyoCatalogRouter = createTRPCRouter({
  get: {
    categories: {
      count: klaviyoProcedure.query(async () => {
        return (await getCategories(["external_id"])).length;
      }),
      all: klaviyoProcedure.query(async () => {
        return await getCategories(["external_id", "name"]);
      }),
    },
  },
  sync: {
    categories: klaviyoProcedure.mutation(async () => {
      const synced = await getCategories(["external_id", "name"]);
      const local = await e
        .select(e.ecommerce.Category, () => ({
          cfId: true,
          description: true,
        }))
        .run(client);

      const truth = local.map((c) => ({
        ...c,
        foreign: synced.find(
          (s) => s.attributes.externalId === c.cfId.toString(),
        ),
      }));

      const toDelete = synced.filter(
        (s) =>
          !local.find((l) => s.attributes.externalId === l.cfId.toString()),
      );
      const toCreate = truth
        .filter((c) => !c.foreign?.id)
        .map((c) => ({
          cfId: c.cfId,
          name: c.description,
        }));
      const toUpdate = truth
        .filter((c) => c.foreign && c.foreign.attributes.name !== c.description)
        .map((c) => ({
          id: c.foreign!.id,
          name: c.description,
        }));

      await createCategories(toCreate);
      await updateCategories(toUpdate);
      await deleteCategories(toDelete.map((c) => c.id));

      return {
        created: toCreate.length,
        updated: toUpdate.length,
        deleted: toDelete.length,
      };
    }),
  },
});
