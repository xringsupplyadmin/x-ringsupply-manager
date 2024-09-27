"use server";

import { apiSearchProducts } from "~/server/api/functions/ecommerce/cf_api";
import type { FilterStore } from "./stores";
import type { ImportProduct } from "~/components/ecommerce/product";

import e from "@/dbschema/edgeql-js";
import client from "~/server/db/client";

export async function apiSearchProductAction(
  filters: FilterStore,
  pageData?: { limit: number; offset: number },
) {
  // TODO sanitize inputs
  const results = await apiSearchProducts(
    {
      searchText: filters.searchText,
    },
    pageData,
    {
      categories: filters.categories,
      departments: filters.departments,
      manufacturers: filters.manufacturers,
      tags: filters.tags,
      locations: filters.locations,
      out_of_stock: filters.showOutOfStock,
    },
  );

  return results;
}

export async function dbSearchProductAction(
  filters: FilterStore,
  pageData?: { limit: number; offset: number },
) {
  // TODO sanitize inputs
  const results = await e.select(e.products.Product, (p) => {
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
          e.op(p.productManufacturerId, "in", e.set(...filters.manufacturers)),
        ),
      );
    }
    if (filters.tags.length > 0) {
      ops.push(
        e.any(
          e.op(e.array_unpack(p.productTagIds), "in", e.set(...filters.tags)),
        ),
      );
    }
    return {
      filter: e.all(e.set(...ops)),
      limit: pageData?.limit,
      offset: pageData?.offset,
      ...p["*"],
      productTags: p.productTags["*"],
      productCategories: p.productCategories["*"],
    };
  });

  return results;
}

export async function importProductAction(product: ImportProduct) {
  await e.insert(e.products.Product, product).run(client);
}
