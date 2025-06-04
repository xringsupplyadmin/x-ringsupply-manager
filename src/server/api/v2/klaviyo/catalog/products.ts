import type {
  CatalogItemCreateQueryResourceObject,
  CatalogItemUpdateQueryResourceObject,
} from "klaviyo-api";
import { allPages, klaviyo, unwrapResponse } from "~/server/api/klaviyo";

export const ItemFields = [
  "external_id",
  "title",
  "description",
  "price",
  "url",
  "image_full_url",
  "image_thumbnail_url",
  "images",
  "custom_metadata",
  "published",
  "created",
  "updated",
] as const;
export type ItemFields = (typeof ItemFields)[number];

export async function getItems(fields: ItemFields[], filter?: string) {
  const categories = await allPages((cursor) =>
    klaviyo.catalog.getCatalogItems({
      fieldsCatalogItem: fields,
      filter: filter,
      pageCursor: cursor,
    }),
  );

  return categories;
}

export type CatalogItem = {
  cfId: number;
  title: string;
  price: number;
  description: string;
  url: string;
  imageFullUrl?: string;
  imageThumbnailUrl?: string;
  images?: string[];
  customMetadata?: Record<string, string>;
  published?: boolean;
  /** The Klaviyo IDs of the categories this item belongs to */
  categories?: string[];
};

export type CatalogItemUpdate = {
  /** The Klaviyo ID of the item */
  id: string;
  title: string;
  price: number;
  description: string;
  url: string;
  imageFullUrl?: string;
  imageThumbnailUrl?: string;
  images?: string[];
  customMetadata?: Record<string, string>;
  published?: boolean;
  /** The Klaviyo IDs of the categories this item belongs to */
  categories?: string[];
};

export type CatalogCategory = { name: string; cfId: number };
export type CatalogCategoryUpdate = { id: string; name: string };

function mapCatalogItem(item: CatalogItem) {
  return {
    type: "catalog-item" as const,
    attributes: {
      externalId: item.cfId.toString(),
      title: item.title,
      price: item.price,
      description: item.description,
      url: item.url,
      imageFullUrl: item.imageFullUrl,
      imageThumbnailUrl: item.imageThumbnailUrl,
      images: item.images,
      customMetadata: item.customMetadata,
      published: item.published,
    },
    relationships: {
      categories: {
        data: item.categories?.map((cId) => ({
          type: "catalog-category" as const,
          id: cId,
        })),
      },
    },
  } satisfies CatalogItemCreateQueryResourceObject;
}

function mapCatalogItemUpdate(item: CatalogItemUpdate) {
  return {
    id: item.id,
    type: "catalog-item" as const,
    attributes: {
      title: item.title,
      price: item.price,
      description: item.description,
      url: item.url,
      imageFullUrl: item.imageFullUrl,
      imageThumbnailUrl: item.imageThumbnailUrl,
      images: item.images,
      customMetadata: item.customMetadata,
      published: item.published,
    },
    relationships: {
      categories: {
        data: item.categories?.map((cId) => ({
          type: "catalog-category" as const,
          id: cId,
        })),
      },
    },
  } satisfies CatalogItemUpdateQueryResourceObject;
}

export async function createItem(item: CatalogItem) {
  const body = unwrapResponse(
    await klaviyo.catalog.createCatalogItem({
      data: mapCatalogItem(item),
    }),
  );

  return body.data.id;
}

export async function createItems(items: CatalogItem[]) {
  const ids: Record<number, string> = {};
  const failedIds: number[] = [];

  for (const item of items) {
    try {
      ids[item.cfId] = await createItem(item);
    } catch {
      failedIds.push(item.cfId);
    }
  }

  return {
    importedKlaviyoIds: ids,
    failedImportCfIds: failedIds,
  };
}

export async function updateItem(item: CatalogItemUpdate) {
  unwrapResponse(
    await klaviyo.catalog.updateCatalogItem(item.id, {
      data: mapCatalogItemUpdate(item),
    }),
  );
}

export async function updateItems(items: CatalogItemUpdate[]) {
  const failedIds: string[] = [];

  for (const item of items) {
    try {
      await updateItem(item);
    } catch {
      failedIds.push(item.id);
    }
  }

  return {
    failedUpdateIds: failedIds,
  };
}

export async function deleteItem(itemId: string) {
  unwrapResponse(await klaviyo.catalog.deleteCatalogItem(itemId));
}

export async function deleteItems(itemIds: string[]) {
  const failedIds: string[] = [];

  for (const itemId of itemIds) {
    try {
      await deleteItem(itemId);
    } catch {
      failedIds.push(itemId);
    }
  }

  return {
    failedDeleteIds: failedIds,
  };
}
