"use client";

import type { ecommerce } from "@/dbschema/interfaces";
import parse from "html-react-parser";
import Image from "next/image";
import type { ComponentProps } from "react";
import { urlJoinP } from "url-join-ts";
import { env } from "~/env";
import type { ApiProduct } from "~/server/api/coreforce/types";
import { Alert } from "../ui/alert";
import { Badge } from "../ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "../ui/card";
import { Loader2 } from "lucide-react";

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

// Make DB-only properties optional
type DisplayProduct = ApiProduct &
  Pick<
    Partial<ecommerce.Product>,
    "id" | "productManufacturer" | "productTags"
  > & {
    productCategories?: Omit<ecommerce.Category, "department">[];
  };

export function ProductCard<Product extends DisplayProduct>({
  product,
  minimal = false,
  footerControls,
}: {
  product: Product;
  minimal?: boolean;
  footerControls?: (product: Product) => JSX.Element;
}) {
  return (
    <Card className="flex flex-col">
      <CardHeader className="flex flex-row gap-4">
        <ProductImage
          description={product.description}
          imageId={product.imageId}
          imageUrls={product.imageUrls}
          className="max-h-24 max-w-40 flex-auto object-contain"
        />
        <h2 className="mini-scrollbar h-24 flex-auto overflow-y-scroll text-ellipsis text-lg font-bold">
          {product.description}
        </h2>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col">
        <h3 className="text-lg font-semibold">Description</h3>
        <div className="my-2 min-w-full basis-1 rounded bg-accent/50" />
        <div className="mini-scrollbar h-full max-h-32 overflow-y-scroll">
          {/* <p className="break-words">{product.detailedDescription}</p> */}
          {product.detailedDescription &&
            parse(product.detailedDescription, {
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
        {!minimal && <ProductDetail product={product} />}
      </CardContent>
      <CardFooter className="flex flex-row justify-between gap-4">
        <div className="flex flex-col items-start justify-between text-left text-sm italic">
          <small>
            <p>DbID: {product.id ? product.id : "Not imported"}</p>
            <p>CfID: {product.cfId}</p>
          </small>
        </div>
        {footerControls && (
          <div className="flex items-end">{footerControls(product)}</div>
        )}
      </CardFooter>
    </Card>
  );
}

function ProductDetail<Product extends DisplayProduct>({
  product,
}: {
  product: Product;
}) {
  return (
    <>
      <h3 className="text-lg font-semibold">Categories</h3>
      <div className="flex h-10 items-center justify-center">
        {product.productCategories ? (
          product.productCategories.length === 0 ? (
            <p>None</p>
          ) : (
            <div className="mini-scrollbar flex h-full w-full flex-nowrap items-stretch justify-center gap-2 overflow-x-scroll p-1">
              {product.productCategories.map((category) => (
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
      </div>

      <h3 className="text-lg font-semibold">Tags</h3>
      <div className="flex h-10 items-center justify-center">
        {product.productTags ? (
          product.productTags.length === 0 ? (
            <p>None</p>
          ) : (
            <div className="mini-scrollbar flex h-full w-full flex-nowrap items-stretch justify-center gap-2 overflow-x-scroll p-1">
              {product.productTags.map((tag) => (
                <Badge
                  className="w-max max-w-32 overflow-clip text-ellipsis text-nowrap hover:max-w-full"
                  key={tag.cfId}
                >
                  {tag.description}
                </Badge>
              ))}
            </div>
          )
        ) : (
          <Loader2 className="animate-spin" />
        )}
      </div>

      <div className="h-8">
        <div className="flex h-full items-center gap-2">
          <h3 className="text-lg font-semibold">Manufacturer</h3>
          {product.productManufacturer !== undefined ? (
            <p>
              {product.productManufacturer === null
                ? "None"
                : product.productManufacturer.description}
            </p>
          ) : (
            <Loader2 className="animate-spin" />
          )}
        </div>
      </div>
    </>
  );
}
