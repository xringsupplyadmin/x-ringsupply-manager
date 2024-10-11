import e from "@/dbschema/edgeql-js";
import { cache } from "react";
import client from "~/server/db/client";
import {
  CoreforceFilter,
  SearchTextFilter,
  ShowOutOfStockFilter,
} from "./filters_components";

export async function CategoryFilter() {
  const categories = await e
    .select(e.ecommerce.Category, () => ({
      cfId: true,
      description: true,
    }))
    .run(client);

  return <CoreforceFilter values={categories} storeName="categories" />;
}

export async function DepartmentFilter() {
  const departments = await e
    .select(e.ecommerce.Department, () => ({
      cfId: true,
      description: true,
    }))
    .run(client);

  return <CoreforceFilter values={departments} storeName="departments" />;
}

export async function ManufacturerFilter() {
  const manufacturers = await cache(
    async () =>
      await e
        .select(e.ecommerce.Manufacturer, (m) => ({
          cfId: true,
          description: true,
          filter: e.op(m.inactive, "=", false),
        }))
        .run(client),
  )();

  return <CoreforceFilter values={manufacturers} storeName="manufacturers" />;
}

export async function TagFilter() {
  const tags = await e
    .select(e.ecommerce.Tag, () => ({
      cfId: true,
      description: true,
    }))
    .run(client);

  return <CoreforceFilter values={tags} storeName="tags" />;
}

export async function LocationFilter() {
  const locations = await e
    .select(e.ecommerce.Location, () => ({
      cfId: true,
      description: true,
    }))
    .run(client);

  return <CoreforceFilter values={locations} storeName="locations" />;
}

export function SearchFilters() {
  return (
    <>
      <SearchTextFilter />
      <CategoryFilter />
      <DepartmentFilter />
      <ManufacturerFilter />
      <TagFilter />
      <LocationFilter />
      <ShowOutOfStockFilter />
    </>
  );
}
