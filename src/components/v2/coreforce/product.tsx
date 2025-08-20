"use client";

import Image from "next/image";
import type { ReactNode } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "~/components/ui/card";
import {
  CoreforceProduct,
  ProductExtraInformation,
} from "~/server/api/v2/coreforce/types/products";
import { Heading } from "~/components/headings";
import { Table, TableBody, TableCell, TableRow } from "~/components/ui/table";
import { getStateName } from "~/server/api/v2/types/geography";
import { HorizontalSeparator } from "~/components/separator";
import { parseExternalHtml } from "~/lib/external-html";

export function ProductCard<Product extends CoreforceProduct>({
  product,
  extra,
  footerControls,
}: {
  product: Product;
  extra?: ProductExtraInformation;
  footerControls?: (product: Product) => ReactNode;
}) {
  console.log(product);
  return (
    <Card className="flex flex-col">
      <CardHeader className="flex flex-row gap-4">
        <h2 className="flex-auto text-ellipsis text-lg font-bold">
          {product.description}
        </h2>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4">
        <div
          className={"flex flex-row items-center gap-4 overflow-x-scroll"}
          style={{
            justifyContent: "safe center", // todo: replace with tailwind class when updated to v4
          }}
        >
          {product.image_urls.map((url, index) => (
            <Image
              key={url}
              src={url}
              alt={product.description ?? `Image ${index + 1}`}
              width={0}
              height={0}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className={"h-full max-h-64 w-auto"}
            />
          ))}
        </div>
        <Heading className={"text-center"}>Description</Heading>
        <div className="max-h-64 flex-initial overflow-y-scroll">
          {product.detailed_description.trim() === "" ? (
            <p>No description available</p>
          ) : (
            parseExternalHtml(product.detailed_description)
          )}
        </div>
        <HorizontalSeparator />
        {extra && extra.restricted_states.length > 0 && (
          <div
            className={
              "flex flex-row flex-wrap items-center justify-start gap-4"
            }
          >
            <Heading className={"flex-none"}>Sale not allowed in</Heading>
            <p className={"min-w-32 flex-auto basis-0"}>
              {extra.restricted_states
                .map((state) => getStateName(state))
                .join(", ")}
            </p>
          </div>
        )}
        <Heading className={"text-center"}>Specifications</Heading>
        {product.product_facets.length === 0 && (
          <p>No specifications available</p>
        )}
        {product.product_facets.length > 0 && (
          <>
            <Table>
              <TableBody>
                {product.product_facets.map((facet) => (
                  <TableRow key={facet.product_facet_id}>
                    <TableCell>{facet.description}</TableCell>
                    <TableCell>{facet.facet_value}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </>
        )}
      </CardContent>
      <CardFooter className="flex flex-row justify-between gap-4">
        <div className="flex flex-col items-start justify-between text-left text-sm italic">
          <p className={"text-sm"}>ID {product.product_id}</p>
        </div>
        {footerControls && (
          <div className="flex items-end">{footerControls(product)}</div>
        )}
      </CardFooter>
    </Card>
  );
}
