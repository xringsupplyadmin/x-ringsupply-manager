import { z } from "zod";
import { FilterStore } from "~/lib/stores";
import { ApiProduct } from "../coreforce/api_util";
import {
  apiGetProduct,
  apiSearchProducts,
  ProductIdentifier,
} from "../coreforce/search_product";
import { createTRPCRouter, protectedProcedure } from "../trpc";

async function searchProducts(
  filters: FilterStore & { productId?: number },
  pageData?: { limit: number; offset: number },
) {
  const results = await apiSearchProducts(
    filters.productId
      ? { productId: filters.productId }
      : {
          searchText: filters.searchText,
        },
    pageData,
    {
      categories: filters.categories,
      departments: filters.departments,
      manufacturers: filters.manufacturers,
      tags: filters.tags,
      locations: filters.locations,
      hideOutOfStock: filters.hideOutOfStock,
    },
  );

  return results;
}

export const ecommerceRouter = createTRPCRouter({
  cfApi: {
    products: {
      count: protectedProcedure
        .input(
          z.object({
            filters: FilterStore,
          }),
        )
        .output(z.number())
        .query(async ({ input: { filters } }) => {
          const data = await searchProducts(filters, {
            limit: 0,
            offset: 999999,
          });
          return data.queryItemCount;
        }),
      search: protectedProcedure
        .input(
          z.object({
            filters: FilterStore,
            pageData: z
              .object({ limit: z.number(), offset: z.number() })
              .optional(),
          }),
        )
        .query(async ({ input: { filters, pageData } }) => {
          const data = await searchProducts(filters, pageData);
          if (data.data.length === 0) {
            // Try searching by product ID
            try {
              const productId = parseInt(filters.searchText);
              const data = await searchProducts(
                {
                  productId: productId,
                  ...filters,
                },
                pageData,
              );
              return data;
            } catch {
              /* Ignore */
            }
          }
          return data;
        }),
      get: protectedProcedure
        .input(ProductIdentifier)
        .query(async ({ input }) => {
          return await apiGetProduct(input);
        }),
    },
  },
  db: {
    products: {
      importProduct: protectedProcedure
        .input(
          z.object({
            product: ApiProduct,
          }),
        )
        .mutation(
          async ({
            ctx: {
              db: { e, client },
            },
            input: { product },
          }) => {
            return await e
              .insert(e.ecommerce.Product, product)
              .unlessConflict((r) => ({
                on: r.cfId,
                else: e.update(r, () => ({
                  set: product,
                })),
              }))
              .run(client);
          },
        ),
      getByCfId: protectedProcedure
        .input(
          z.object({
            cfId: z.number(),
          }),
        )
        .query(
          async ({
            ctx: {
              db: { e, client },
            },
            input: { cfId },
          }) => {
            return await e
              .select(e.ecommerce.Product, (p) => ({
                filter_single: e.op(p.cfId, "=", cfId),
              }))
              .run(client);
          },
        ),
      search: protectedProcedure
        .input(
          z.object({
            filters: FilterStore,
            pageData: z
              .object({
                limit: z.number(),
                offset: z.number(),
              })
              .optional(),
          }),
        )
        .query(
          async ({
            ctx: {
              db: { e, client },
            },
            input: { filters, pageData },
          }) => {
            // Define a set of filters for the query
            const filterOp = e.shape(e.ecommerce.Product, (p) => {
              const ops = [];
              if (filters.categories.length > 0) {
                ops.push(
                  e.any(
                    e.op(
                      e.array_unpack(p.productCategoryIds),
                      "in",
                      e.set(...filters.categories),
                    ),
                  ),
                );
              }
              if (filters.departments.length > 0) {
                ops.push(
                  e.any(
                    e.op(
                      p.productCategories.department.cfId,
                      "in",
                      e.set(...filters.departments),
                    ),
                  ),
                );
              }
              if (filters.manufacturers.length > 0) {
                ops.push(
                  e.any(
                    e.op(
                      p.productManufacturerId,
                      "in",
                      e.set(...filters.manufacturers),
                    ),
                  ),
                );
              }
              if (filters.tags.length > 0) {
                ops.push(
                  e.any(
                    e.op(
                      e.array_unpack(p.productTagIds),
                      "in",
                      e.set(...filters.tags),
                    ),
                  ),
                );
              }
              return {
                filter: ops.length > 0 ? e.all(e.set(...ops)) : undefined,
              };
            });

            const dataQuery = e.select(e.ecommerce.Product, (p) => {
              return {
                ...filterOp(p),
                limit: pageData?.limit,
                offset: pageData?.offset,
                ...p["*"],
                productTags: p.productTags["*"],
                productCategories: p.productCategories["*"],
              };
            });

            const totalCountQuery = e.count(
              e.select(e.ecommerce.Product, (p) => filterOp(p)),
            );

            // select the data and count the total number of products
            const results = await e
              .select({
                data: dataQuery,
                totalCount: totalCountQuery,
                hasNextPage: e.op(
                  e.op(pageData?.offset ?? 0, "+", e.count(dataQuery)),
                  "<",
                  totalCountQuery,
                ),
              })
              .run(client);

            return results;
          },
        ),
    },
  },
});
