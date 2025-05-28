"use client";

import type { ecommerce } from "@/dbschema/interfaces";
import { useCallback, useEffect, useState } from "react";
import { ProductCard } from "~/components/ecommerce/product";
import { ProductSearchControls } from "~/components/ecommerce/product_search";
import { PagedCardGrid } from "~/components/paginator";
import type { ApiProduct } from "~/server/api/coreforce/types";
import { useFilterStore } from "~/stores/providers/filter_store_provider";
import { api } from "~/trpc/react";

export default function CatalogImportPage() {
  const trpc = api.useUtils();
  const filterValues = useFilterStore();
  const dataProvider = {
    getData: (pageData: { limit: number; offset: number } | undefined) =>
      trpc.ecommerce.cfApi.products.search.fetch({
        filters: filterValues,
        pageData: pageData,
      }),
    getCountAsync: () =>
      trpc.ecommerce.cfApi.products.count.fetch({ filters: filterValues }),
  };
  const cardComponent = (product: ApiProduct) => (
    <ImportProductCard product={product} key={product.cfId} />
  );

  return (
    <PagedCardGrid
      dataProvider={dataProvider}
      cardComponent={cardComponent}
      controls={ProductSearchControls}
    />
  );
}

function ImportProductCard({ product }: { product: ApiProduct }) {
  const trpc = api.useUtils();

  const [categories, setCategories] =
    useState<Omit<ecommerce.Category, "department">[]>();
  const [tags, setTags] = useState<ecommerce.Tag[]>();
  const [manufacturer, setManufacturer] =
    useState<ecommerce.Manufacturer | null>();

  const updateTaxonomy = useCallback(async () => {
    const categories = await trpc.ecommerce.db.taxonomy.getCategories.fetch({
      cfIds: product.productCategoryIds,
    });
    setCategories(categories);
    const tags = await trpc.ecommerce.db.taxonomy.getTags.fetch({
      cfIds: product.productTagIds,
    });
    setTags(tags);

    if (product.productManufacturerId) {
      const manufacturer =
        await trpc.ecommerce.db.taxonomy.getManufacturer.fetch({
          cfId: product.productManufacturerId,
        });
      setManufacturer(manufacturer);
    } else {
      setManufacturer(null);
    }
  }, [
    trpc,
    product.productCategoryIds,
    product.productTagIds,
    product.productManufacturerId,
  ]);

  useEffect(() => {
    updateTaxonomy();
  }, [updateTaxonomy]);

  return (
    <ProductCard
      product={{
        ...product,
        productCategories: categories,
        productTags: tags,
        productManufacturer: manufacturer,
      }}
    />
  );
}
