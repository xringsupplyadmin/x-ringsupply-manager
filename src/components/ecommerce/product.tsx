import type { ecommerce } from "@/dbschema/interfaces";
import parse from "html-react-parser";
import Image from "next/image";
import type { ComponentProps } from "react";
import { urlJoinP } from "url-join-ts";
import { env } from "~/env";
import { Alert } from "../ui/alert";
import { Card, CardContent, CardFooter, CardHeader } from "../ui/card";
import type { ApiProduct } from "~/server/api/coreforce/api_util";

function ProductImage({
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
    <Image
      src={"https://placehold.co/300/jpg?text=Image+Not+Found"}
      alt="Image not found"
      width={300}
      height={300}
      {...props}
    />;
  }
}

// Weird type union to get the DB-only properties to be optional
type DisplayProduct = ApiProduct & Partial<Pick<ecommerce.Product, "id">>;

export function ProductCard({
  product,
  footerControls,
}: {
  product: DisplayProduct;
  footerControls?: (product: DisplayProduct) => JSX.Element;
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
        <h2 className="h-24 flex-auto overflow-y-scroll text-ellipsis text-lg font-bold">
          {product.description}
        </h2>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col">
        <h3 className="text-lg font-semibold">Description</h3>
        <div className="my-2 min-w-full basis-1 rounded bg-accent/50" />
        <div className="h-full max-h-32 overflow-y-scroll">
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
      </CardContent>
      <CardFooter className="flex flex-row gap-4">
        <div className="flex flex-col items-start text-left text-sm italic">
          <small>
            <p>DbID: {product.id ? product.id : "Not yet imported"}</p>
            <p>CfID: {product.cfId}</p>
          </small>
        </div>
        {footerControls && (
          <div className="ml-auto flex items-end">
            {footerControls(product)}
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
