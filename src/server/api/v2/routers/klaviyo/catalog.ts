import e from "@/dbschema/edgeql-js";
import { z } from "zod";
import { apiGetProducts } from "~/server/api/coreforce/search_product";
import { klaviyo } from "~/server/api/klaviyo";
import { createTRPCRouter } from "~/server/api/trpc";
import client from "~/server/db/client";
import {
  createCategories,
  deleteCategories,
  getCategories,
  updateCategories,
} from "../../klaviyo/catalog/categories";
import {
  createItems,
  deleteItems,
  getItems,
} from "../../klaviyo/catalog/products";
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
  delete: {
    products: klaviyoProcedure
      .input(
        z.object({
          ids: z.array(z.number()),
        }),
      )
      .mutation(async ({ input: { ids } }) => {
        const { deleted, failedids: failedDeleteIds } = await deleteItems(
          ids.map((id) => klaviyo.getId(id)),
        );
        return {
          deleted,
          failed: failedDeleteIds,
        };
      }),
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
    products: klaviyoProcedure
      .input(
        z.object({
          ids: z.array(z.number()),
        }),
      )
      .mutation(async ({ input: { ids } }) => {
        const klaviyoProducts = await getItems(
          ["external_id"],
          klaviyo.filter().any(
            "ids",
            ids.map((id) => klaviyo.getId(id)),
          ),
        );

        const coreforceProducts = await apiGetProducts({
          product_ids: ids,
        });

        const toCreate = coreforceProducts.filter(
          (p) =>
            !klaviyoProducts.find(
              (kp) => kp.attributes.externalId === p.cfId.toString(),
            ),
        );
        const toUpdate = coreforceProducts.filter((p) =>
          klaviyoProducts.find(
            (kp) => kp.attributes.externalId === p.cfId.toString(),
          ),
        );

        const { failedIds: failedCreate, klaviyoIds: createdIds } =
          await createItems(
            toCreate.map((p) => ({
              cfId: p.cfId,
              title: p.description,
              description: p.detailedDescription!,
              price: p.listPrice,
              url: p.linkName,
              imageFullUrl: p.primaryImageUrl,
              images: p.imageUrls,
              published: true,
            })),
          );

        return {
          created: Object.keys(createdIds).length,
          updated: toUpdate.length,
          failed: [...failedCreate],
        };
      }),
  },
});
