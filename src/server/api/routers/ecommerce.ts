import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { FilterStore } from "~/stores/filter_store";
import {
  apiGetProduct,
  apiSearchProducts,
  ProductIdentifier,
} from "../coreforce/search_product";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import client from "~/server/db/client";
import e from "@/dbschema/edgeql-js";

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

async function deepSearchProducts(
  filters: FilterStore,
  pageData?: { limit: number; offset: number },
) {
  const data = await searchProducts(filters, pageData);
  if (data.data.length === 0) {
    // Try searching by product ID
    const productId = Number.parseInt(filters.searchText);
    if (!Number.isFinite(productId)) {
      // If search text is not a number, return the original data
      return data;
    }
    return await searchProducts(
      {
        productId: productId,
        ...filters,
      },
      pageData,
    );
  }
  return data;
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
          const products = await deepSearchProducts(filters, pageData);
          return products;
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
            cfId: z.number(),
          }),
        )
        .mutation(
          async ({
            ctx: {
              db: { e, client },
            },
            input: { cfId },
          }) => {
            const product = await apiGetProduct({
              product_id: cfId,
            });

            if (!product) {
              throw new TRPCError({
                message: "Product not found",
                code: "BAD_REQUEST",
              });
            }

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
      importAll: protectedProcedure
        .input(
          z.object({
            filters: FilterStore,
          }),
        )
        .mutation(async ({ input: { filters } }) => {
          const products = await deepSearchProducts(filters);

          if (products.data.length === 0) {
            return 0;
          }

          // await client.transaction(async (tx) => {
          //   for (const product of products.data) {
          //     await e.insert(e.ecommerce.Product, product).run(tx);
          //   }
          // });

          return products.data.length;
        }),
      getById: protectedProcedure
        .input(
          z
            .object({
              cfId: z.number(),
              id: z.undefined(),
            })
            .or(
              z.object({
                cfId: z.undefined(),
                id: z.string(),
              }),
            ),
        )
        .query(
          async ({
            ctx: {
              db: { e, client },
            },
            input: { cfId, id },
          }) => {
            if (cfId !== undefined) {
              return await e
                .select(e.ecommerce.Product, (p) => ({
                  ...p["*"],
                  filter_single: e.op(p.cfId, "=", cfId),
                }))
                .run(client);
            } else if (id !== undefined) {
              return await e
                .select(e.ecommerce.Product, (p) => ({
                  ...p["*"],
                  filter_single: e.op(p.id, "=", e.uuid(id)),
                }))
                .run(client);
            } else {
              throw new TRPCError({
                message: "Either cfId or id must be provided",
                code: "BAD_REQUEST",
              });
            }
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
                productManufacturer: p.productManufacturer["*"],
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
    taxonomy: {
      getSidebar: protectedProcedure.query(
        async ({
          ctx: {
            db: { e, client },
          },
        }) => {
          const categories = await e.select(e.ecommerce.Category, () => ({
            cfId: true,
            description: true,
          }));
          const departments = await e.select(e.ecommerce.Department, () => ({
            cfId: true,
            description: true,
          }));
          const manufacturers = await e.select(
            e.ecommerce.Manufacturer,
            (m) => ({
              cfId: true,
              description: true,
              filter: e.op(m.inactive, "=", false),
            }),
          );
          const tags = await e.select(e.ecommerce.Tag, () => ({
            cfId: true,
            description: true,
          }));
          const locations = await e.select(e.ecommerce.Location, () => ({
            cfId: true,
            description: true,
          }));

          return e
            .select({
              categories: categories,
              departments: departments,
              manufacturers: manufacturers,
              tags: tags,
              locations: locations,
            })
            .run(client);
        },
      ),
      getCategories: protectedProcedure
        .input(
          z.union([
            z.object({
              cfIds: z.number().array(),
              codes: z.undefined(),
            }),
            z.object({
              cfIds: z.undefined(),
              codes: z.string().array(),
            }),
          ]),
        )
        .query(
          async ({
            ctx: {
              db: { e, client },
            },
            input,
          }) => {
            const query = e.select(e.ecommerce.Category, (c) => {
              let filter;
              if (input.cfIds !== undefined) {
                filter = e.op(c.cfId, "in", e.set(...input.cfIds));
              } else {
                filter = e.op(c.code, "in", e.set(...input.codes));
              }

              return {
                ...c["*"],
                filter: filter,
              };
            });

            return query.run(client);
          },
        ),
      getTags: protectedProcedure
        .input(
          z.union([
            z.object({
              cfIds: z.number().array(),
              codes: z.undefined(),
            }),
            z.object({
              cfIds: z.undefined(),
              codes: z.string().array(),
            }),
          ]),
        )
        .query(
          async ({
            ctx: {
              db: { e, client },
            },
            input,
          }) => {
            const query = e.select(e.ecommerce.Tag, (t) => {
              let filter;
              if (input.cfIds !== undefined) {
                filter = e.op(t.cfId, "in", e.set(...input.cfIds));
              } else {
                filter = e.op(t.code, "in", e.set(...input.codes));
              }

              return {
                ...t["*"],
                filter: filter,
              };
            });

            return query.run(client);
          },
        ),
      getManufacturer: protectedProcedure
        .input(
          z.union([
            z.object({
              cfId: z.number(),
              code: z.undefined(),
            }),
            z.object({
              cfId: z.undefined(),
              code: z.string(),
            }),
          ]),
        )
        .query(
          async ({
            ctx: {
              db: { e, client },
            },
            input,
          }) => {
            const query = e.select(e.ecommerce.Manufacturer, (m) => {
              let filter;
              if (input.cfId !== undefined) {
                filter = e.op(m.cfId, "=", input.cfId);
              } else {
                filter = e.op(m.code, "=", input.code);
              }

              return {
                ...m["*"],
                filter_single: filter,
              };
            });

            return query.run(client);
          },
        ),
    },
  },
});
