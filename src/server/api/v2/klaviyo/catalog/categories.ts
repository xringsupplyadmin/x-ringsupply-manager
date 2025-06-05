import type {
  CatalogCategoryCreateQueryResourceObject,
  CatalogCategoryUpdateQueryResourceObject,
  FilterBuilder,
} from "klaviyo-api";
import { allPages, klaviyo } from "~/server/api/klaviyo";

export const CategoryFields = ["external_id", "name", "updated"] as const;
export type CategoryFields = (typeof CategoryFields)[number];

export async function getItem(id: string, fields: CategoryFields[]) {
  return (
    await klaviyo.request(() =>
      klaviyo.catalog.getCatalogCategory(id, {
        fieldsCatalogCategory: fields,
      }),
    )
  ).data;
}

export async function getCategories(
  fields: CategoryFields[],
  filterBuilder?: FilterBuilder,
) {
  const categories = await allPages((cursor) =>
    klaviyo.catalog.getCatalogCategories({
      fieldsCatalogCategory: fields,
      filter: filterBuilder?.build(),
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
  } satisfies CatalogCategoryCreateQueryResourceObject;
}

function mapCatalogCategoryUpdate(category: CatalogCategoryUpdate) {
  return {
    id: category.id,
    type: "catalog-category" as const,
    attributes: {
      name: category.name,
    },
  } satisfies CatalogCategoryUpdateQueryResourceObject;
}

export async function createCategory(category: CatalogCategory) {
  const body = await klaviyo.request(() =>
    klaviyo.catalog.createCatalogCategory({
      data: mapCatalogCategory(category),
    }),
  );

  return body.data.id;
}

export async function createCategories(categories: CatalogCategory[]) {
  const ids: Record<number, string> = {};
  const failedIds: number[] = [];

  for (const category of categories) {
    try {
      ids[category.cfId] = await createCategory(category);
    } catch (e) {
      console.error(e);
      failedIds.push(category.cfId);
    }
  }

  return {
    klaviyoIds: ids,
    failedIds: failedIds,
  };
}

export async function updateCategory(category: CatalogCategoryUpdate) {
  await klaviyo.request(() =>
    klaviyo.catalog.updateCatalogCategory(category.id, {
      data: mapCatalogCategoryUpdate(category),
    }),
  );
}

export async function updateCategories(categories: CatalogCategoryUpdate[]) {
  const failedIds: string[] = [];

  for (const category of categories) {
    try {
      await updateCategory(category);
    } catch (e) {
      console.error(e);
      failedIds.push(category.id);
    }
  }

  return {
    updated: categories.length - failedIds.length,
    failedIds: failedIds,
  };
}

export async function deleteCategory(categoryId: string) {
  await klaviyo.request(() =>
    klaviyo.catalog.deleteCatalogCategory(categoryId),
  );
}

export async function deleteCategories(categoryIds: string[]) {
  const failedIds: string[] = [];

  for (const categoryId of categoryIds) {
    try {
      await deleteCategory(categoryId);
    } catch {
      failedIds.push(categoryId);
    }
  }

  return {
    delete: categoryIds.length - failedIds.length,
    failedIds: failedIds,
  };
}
