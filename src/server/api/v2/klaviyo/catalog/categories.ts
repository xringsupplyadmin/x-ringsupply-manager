import { batchAsync } from "~/lib/batch";
import { allPages, klaviyo } from "~/server/api/klaviyo";

export async function getCategories(
  fields: ("external_id" | "name" | "updated")[],
) {
  const categories = await allPages((cursor) =>
    klaviyo.catalog.getCatalogCategories({
      fieldsCatalogCategory: fields,
      pageCursor: cursor,
    }),
  );

  return categories;
}

export type CatalogCategory = { name: string; cfId: number };
export type CatalogCategoryUpdate = { id: string; name: string };

function mapCatalogCategory(category: CatalogCategory) {
  return {
    type: "catalog-category" as const,
    attributes: {
      externalId: category.cfId.toString(),
      name: category.name,
    },
  };
}

function mapCatalogCategoryUpdate(category: CatalogCategoryUpdate) {
  return {
    id: category.id,
    type: "catalog-category" as const,
    attributes: {
      name: category.name,
    },
  };
}

export async function createCategory(category: CatalogCategory) {
  await klaviyo.catalog.createCatalogCategory({
    data: mapCatalogCategory(category),
  });
}

export async function createCategories(categories: CatalogCategory[]) {
  for (const category of categories) {
    await createCategory(category);
  }
}

export async function bulkCreateCategories(categories: CatalogCategory[]) {
  batchAsync(categories, async (categories) => {
    await klaviyo.catalog.bulkCreateCatalogCategories({
      data: {
        type: "catalog-category-bulk-create-job",
        attributes: {
          categories: {
            data: categories.map(mapCatalogCategory),
          },
        },
      },
    });
  });
}

export async function updateCategory(category: CatalogCategoryUpdate) {
  await klaviyo.catalog.updateCatalogCategory(category.id, {
    data: mapCatalogCategoryUpdate(category),
  });
}

export async function updateCategories(categories: CatalogCategoryUpdate[]) {
  for (const category of categories) {
    await updateCategory(category);
  }
}

export async function bulkUpdateCategories(
  categories: CatalogCategoryUpdate[],
) {
  batchAsync(categories, async (categories) => {
    await klaviyo.catalog.bulkUpdateCatalogCategories({
      data: {
        type: "catalog-category-bulk-update-job",
        attributes: {
          categories: {
            data: categories.map(mapCatalogCategoryUpdate),
          },
        },
      },
    });
  });
}

export async function deleteCategory(categoryId: string) {
  await klaviyo.catalog.deleteCatalogCategory(categoryId);
}

export async function deleteCategories(categoryIds: string[]) {
  for (const categoryId of categoryIds) {
    await deleteCategory(categoryId);
  }
}

export async function bulkDeleteCategories(categoryIds: string[]) {
  batchAsync(categoryIds, async (categoryIds) => {
    await klaviyo.catalog.bulkDeleteCatalogCategories({
      data: {
        type: "catalog-category-bulk-delete-job",
        attributes: {
          categories: {
            data: categoryIds.map((id) => ({
              type: "catalog-category",
              id,
            })),
          },
        },
      },
    });
  });
}
