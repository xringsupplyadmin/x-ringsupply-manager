import { allPages, klaviyo } from "~/server/api/klaviyo";

export async function getCategories() {
  const categories = await allPages((cursor) =>
    klaviyo.catalog.getCatalogCategories({
      fieldsCatalogCategory: ["external_id"],
      pageCursor: cursor,
    }),
  );

  return categories;
}

export type CatalogCategory = { name: string; cfId: number };

export async function createCategory(category: CatalogCategory) {
  await klaviyo.catalog.createCatalogCategory({
    data: {
      type: "catalog-category",
      attributes: {
        externalId: category.cfId.toString(),
        name: category.name,
      },
    },
  });
}

export async function createCategories(categories: CatalogCategory[]) {
  klaviyo.catalog.bulkCreateCatalogCategories({
    data: {
      type: "catalog-category-bulk-create-job",
      attributes: {
        categories: {
          data: categories.map((c) => ({
            type: "catalog-category",
            attributes: {
              externalId: c.cfId.toString(),
              name: c.name,
            },
          })),
        },
      },
    },
  });
}
