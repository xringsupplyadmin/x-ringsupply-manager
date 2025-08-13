import { PageTitle } from "~/components/headings";
import { ProductCard } from "~/components/v2/coreforce/product";
import { api } from "~/trpc/server";
import { ProductIssueForm } from "./issue-form";

export default async function ProductIssuePage({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const { productId: productIdStr } = await params;
  const productId = Number.parseInt(productIdStr);

  if (Number.isNaN(productId)) {
    throw new Error("Invalid product ID");
  }

  const product = await api.v2.coreforce.products.get({
    product_id: productId,
  });
  const extraInformation = await api.v2.coreforce.products.getExtraInformation({
    product_id: productId,
  });

  if (!product) {
    throw new Error("Product not found");
  }

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-4">
      <PageTitle>Product Issue Reporting</PageTitle>
      <div className={"flex flex-1 flex-row flex-wrap gap-6"}>
        <div className={"min-w-96 flex-1"}>
          <ProductCard product={product} extraInformation={extraInformation} />
        </div>
        <div className={"min-w-96 flex-1"}>
          <ProductIssueForm
            product={product}
            extraInformation={extraInformation}
          />
        </div>
      </div>
    </div>
  );
}
