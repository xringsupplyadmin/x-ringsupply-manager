"use client";

import parse, { Element } from "html-react-parser";
import Image from "next/image";
import type { ComponentProps, ReactNode } from "react";
import { urlJoinP } from "url-join-ts";
import { env } from "~/env";
import { Alert } from "~/components/ui/alert";
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

export function ProductImage({
  description,
  imageId,
  imageUrls,
  ...props
}: {
  description?: string;
  imageId?: number | null;
  imageUrls?: string[] | null;
} & Omit<ComponentProps<typeof Image>, "src" | "alt">) {
  if (imageId) {
    return (
      <Image
        src={urlJoinP(env.NEXT_PUBLIC_CF_HOST, ["getimage.php"], {
          image_id: imageId,
        })}
        alt={description ?? `Image ${imageId}`}
        width={300}
        height={300}
        {...props}
      />
    );
  } else if (imageUrls && imageUrls.length > 0) {
    return (
      <Image
        src={imageUrls[0]!}
        alt={description ?? `Image ${imageUrls[0]}`}
        width={300}
        height={300}
        {...props}
      />
    );
  } else {
    return (
      <Image
        src={"https://placehold.co/300/jpg?text=Image+Not+Found"}
        alt="Image not found"
        width={300}
        height={300}
        {...props}
      />
    );
  }
}

export function ProductCard<Product extends CoreforceProduct>({
  product,
  extraInformation,
  footerControls,
}: {
  product: Product;
  extraInformation?: ProductExtraInformation;
  footerControls?: (product: Product) => ReactNode;
}) {
  return (
    <Card className="flex flex-col">
      <CardHeader className="flex flex-row gap-4">
        <ProductImage
          description={product.description}
          imageId={product.image_id}
          imageUrls={product.image_urls}
          className="max-h-24 max-w-40 flex-auto object-contain"
        />
        <h2 className="mini-scrollbar h-24 flex-auto overflow-y-scroll text-ellipsis text-lg font-bold">
          {product.description}
        </h2>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4">
        <Heading className={"text-center"}>Description</Heading>
        <div className="mini-scrollbar h-full max-h-32 overflow-y-scroll">
          {/* <p className="break-words">{product.detailedDescription}</p> */}
          {product.detailed_description &&
            parse(product.detailed_description, {
              replace: (domNode) => {
                if (domNode instanceof Element) {
                  if (domNode.tagName === "script") {
                    return (
                      <Alert variant="destructive">
                        Illegal script tag in item description!
                      </Alert>
                    );
                  }
                  if (domNode.tagName === "style") {
                    return (
                      <Alert variant="default">
                        Illegal style tag in item description!
                      </Alert>
                    );
                  }
                }
              },
            })}
        </div>
        {extraInformation && <ProductDetail data={extraInformation} />}
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

function ProductDetail({ data }: { data: ProductExtraInformation }) {
  return (
    <>
      <Heading className={"text-center"}>Specifications</Heading>
      <Table>
        <TableBody>
          {Object.entries(data.product_facets).map(([key, value]) => (
            <TableRow key={key}>
              <TableCell>{key}</TableCell>
              <TableCell>{value}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {/* <h3 className="text-lg font-semibold">Categories</h3>
      <div className="flex h-10 items-center justify-center">
        {product.product_categories ? (
          product.product_categories.length === 0 ? (
            <p>None</p>
          ) : (
            <div className="mini-scrollbar flex h-full w-full flex-nowrap items-stretch justify-center gap-2 overflow-x-scroll p-1">
              {product.product_categories.map((category) => (
                <Badge
                  className="w-max max-w-32 overflow-clip text-ellipsis text-nowrap hover:max-w-full"
                  key={category.cfId}
                >
                  {category.description}
                </Badge>
              ))}
            </div>
          )
        ) : (
          <Loader2 className="animate-spin" />
        )}
      </div> */}

      {/* <div className="h-8">
        <div className="flex h-full items-center gap-2">
          <h3 className="text-lg font-semibold">Manufacturer</h3>
          {product.product_manufacturer !== undefined ? (
            <p>
              {product.product_manufacturer === null
                ? "None"
                : product.product_manufacturer.description}
            </p>
          ) : (
            <Loader2 className="animate-spin" />
          )}
        </div>
      </div> */}
    </>
  );
}
