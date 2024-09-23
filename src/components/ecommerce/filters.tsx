import e from "@/dbschema/edgeql-js";
import client from "~/server/db/client";
import { CoreforceFilter } from "./filters_components";
import { cache } from "react";

export async function CategoryFilter() {
  const categories = await e
    .select(e.products.Category, () => ({
      cfId: true,
      description: true,
    }))
    .run(client);

  return <CoreforceFilter values={categories} storeName="categories" />;
}

export async function DepartmentFilter() {
  const departments = await e
    .select(e.products.Department, () => ({
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
        .select(e.products.Manufacturer, () => ({
          cfId: true,
          description: true,
        }))
        .run(client),
  )();

  return <CoreforceFilter values={manufacturers} storeName="manufacturers" />;
}

export async function TagFilter() {
  const tags = await e
    .select(e.products.Tag, () => ({
      cfId: true,
      description: true,
    }))
    .run(client);

  return <CoreforceFilter values={tags} storeName="tags" />;
}

export async function LocationFilter() {
  const locations = await e
    .select(e.products.Location, () => ({
      cfId: true,
      description: true,
    }))
    .run(client);

  return <CoreforceFilter values={locations} storeName="locations" />;
}
