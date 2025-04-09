"use client";

import { ArrowUpRightFromSquare, Loader2, RotateCcw, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import type React from "react";
import { useCallback, useState } from "react";
import { useToast } from "~/hooks/use-toast";
import { cn } from "~/lib/utils";
import type { ApiProductEditable } from "~/server/api/coreforce/types";
import { useEditorStore } from "~/stores/providers/editor_store_provider";
import { api } from "~/trpc/react";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogTitle } from "../ui/dialog";
import { Input, TextArea } from "../ui/input";
import { ProductImage } from "./product";

type Mismatch = {
  edited: boolean;
  remote: boolean;
};

const wrapperClasses = cn(
  "flex w-full flex-1 flex-col flex-wrap items-start justify-center gap-2",
);

const labelClasses = cn("max-w-32 flex-1 text-sm font-semibold");

const inputClasses = (mismatch: Mismatch) =>
  cn(
    "min-w-48 flex-1",
    mismatch.edited ? "border-warning" : undefined,
    mismatch.remote ? "border-success" : undefined,
  );

function isSomething(a: unknown, b: unknown) {
  return !!a || !!b;
}

export function ProductEditor({
  productCfId,
  className,
  simplified = false,
  ...props
}: {
  productCfId: number;
  simplified?: boolean;
} & React.HTMLAttributes<HTMLDivElement>) {
  const { toast } = useToast();
  const { data: dbProduct } = api.ecommerce.db.products.getById.useQuery({
    cfId: productCfId,
  });
  const { data: apiProduct } = api.ecommerce.cfApi.products.get.useQuery({
    product_id: productCfId,
  });
  const utils = api.useUtils();
  const dbUpdate = api.ecommerce.db.products.update.useMutation();
  const apiUpdate = api.ecommerce.cfApi.products.update.useMutation();
  const edits = useEditorStore((state) => state.edits[productCfId]);
  const { update, reset } = useEditorStore();

  const saved = edits === undefined;
  const [allowEditProtected, _setAllowEditProtected] = useState(false);

  const editField = useCallback(
    <Field extends keyof ApiProductEditable>(
      field: Field,
      value: ApiProductEditable[Field],
    ) => {
      update(productCfId, {
        [field]: value,
      });
    },
    [productCfId, update],
  );

  const getFieldDisplayValue = useCallback(
    <Field extends keyof ApiProductEditable>(
      field: Field,
    ): ApiProductEditable[Field] => {
      if (!dbProduct)
        throw new Error("Function called before initialization complete");

      if (edits && edits[field] !== undefined) {
        return edits[field] as ApiProductEditable[Field]; // Cast to the correct type
      }

      return dbProduct[field];
    },
    [dbProduct, edits],
  );

  const mismatch = useCallback(
    <Field extends keyof ApiProductEditable>(field: Field) => {
      if (!dbProduct)
        throw new Error("Function called before initialization complete");

      const mismatch = {
        edited: false,
        remote: false,
      };

      if (!!edits?.[field] && edits[field] !== dbProduct[field])
        mismatch.edited = true;
      if (
        !!apiProduct &&
        (!!apiProduct[field] || !!dbProduct[field]) &&
        apiProduct[field] !== dbProduct[field]
      )
        mismatch.remote = true;

      return mismatch;
    },
    [dbProduct, apiProduct, edits],
  );

  const saveDb = useCallback(() => {
    if (!edits) return;
    dbUpdate.mutate(
      {
        id: {
          cfId: productCfId,
        },
        data: edits,
      },
      {
        onSuccess() {
          toast({
            title: "Changes saved!",
          });
          reset(productCfId);
          utils.ecommerce.db.products.getById.invalidate();
        },
        onError(error) {
          toast({
            title: "Error saving changes",
            description: error.message,
            variant: "destructive",
          });
        },
      },
    );
  }, [dbUpdate, productCfId, edits, toast, reset, utils]);

  const saveApi = useCallback(() => {
    apiUpdate.mutate(
      {
        cfId: productCfId,
      },
      {
        onSuccess() {
          toast({
            title: "Changes uploaded!",
          });
          utils.ecommerce.cfApi.products.get.invalidate();
        },
        onError(error) {
          toast({
            title: "Error uploading changes",
            description: error.message,
            variant: "destructive",
          });
        },
      },
    );
  }, [apiUpdate, productCfId, toast]);

  if (!dbProduct) return <Loader2 className="animate-spin" />;

  return (
    <div
      className={cn(className, "flex w-full flex-col items-center gap-2")}
      {...props}
    >
      <div className="flex w-full flex-row justify-end gap-2">
        <Button
          onClick={() => {
            reset(productCfId);
          }}
          disabled={saved}
          title="reset"
          icon={<RotateCcw />}
        >
          Reset
        </Button>
        <Button
          onClick={saveDb}
          disabled={dbUpdate.isPending}
          title="Save"
          icon={<Save />}
        >
          Save
        </Button>
        <Button
          onClick={saveApi}
          disabled={!saved}
          title={
            saved ? "Sync to CoreFORCE" : "Please save changes before syncing"
          }
          icon={<ArrowUpRightFromSquare />}
        >
          Sync
        </Button>
      </div>
      <div className="flex w-full flex-row items-center gap-2">
        <ProductImage
          description={dbProduct.description}
          imageId={dbProduct.imageId}
          imageUrls={dbProduct.imageUrls}
          className="max-h-24 max-w-40 flex-auto object-contain"
          priority={true}
        />
        <div className={wrapperClasses}>
          <div className={wrapperClasses}>
            <label className={labelClasses}>Title</label>
            <Input
              className={inputClasses(mismatch("description"))}
              defaultValue={getFieldDisplayValue("description")}
              onChange={(e) => {
                editField("description", e.target.value);
              }}
            />
          </div>
          <div className="flex w-full flex-row items-center gap-2">
            <div className={wrapperClasses}>
              <label className={labelClasses}>Code</label>
              <Input
                className={inputClasses(mismatch("code"))}
                defaultValue={getFieldDisplayValue("code")}
                onChange={(e) => {
                  editField("code", e.target.value);
                }}
              />
            </div>
            <div className={wrapperClasses}>
              <label className={labelClasses}>UPC Code</label>
              <Input
                type="number"
                className={inputClasses(mismatch("upcCode"))}
                defaultValue={getFieldDisplayValue("upcCode") ?? undefined}
                onChange={(e) => {
                  editField("upcCode", e.target.value);
                }}
                disabled={!allowEditProtected}
              />
            </div>
          </div>
        </div>
      </div>
      <div className={wrapperClasses}>
        <label className={labelClasses}>Description</label>
        <TextArea
          className={cn(
            "min-h-48",
            inputClasses(mismatch("detailedDescription")),
          )}
          defaultValue={
            getFieldDisplayValue("detailedDescription") ?? undefined
          }
          onChange={(e) => {
            editField("detailedDescription", e.target.value);
          }}
        />
      </div>
      <div className="flex w-full flex-row items-center gap-2">
        <div className={wrapperClasses}>
          <label className={labelClasses}>Manufacturer SKU</label>
          <Input
            className={inputClasses(mismatch("manufacturerSku"))}
            defaultValue={getFieldDisplayValue("manufacturerSku") ?? undefined}
            onChange={(e) => {
              editField("manufacturerSku", e.target.value);
            }}
          />
        </div>
        <div className={wrapperClasses}>
          <label className={labelClasses}>Model</label>
          <Input
            className={inputClasses(mismatch("model"))}
            defaultValue={getFieldDisplayValue("model") ?? undefined}
            onChange={(e) => {
              editField("model", e.target.value);
            }}
          />
        </div>
      </div>
      <div className={wrapperClasses}>
        <label className={labelClasses}>Link Name</label>
        <Input
          className={inputClasses(mismatch("linkName"))}
          defaultValue={getFieldDisplayValue("linkName") ?? undefined}
          onChange={(e) => {
            editField("linkName", e.target.value);
          }}
        />
      </div>
      <div className="flex w-full flex-row items-center gap-2">
        <div className={wrapperClasses}>
          <label className={labelClasses}>Base Cost</label>
          <Input
            type="number"
            className={inputClasses(mismatch("baseCost"))}
            defaultValue={getFieldDisplayValue("baseCost") ?? undefined}
            onChange={(e) => {
              editField("baseCost", e.target.valueAsNumber);
            }}
            disabled={!allowEditProtected}
          />
        </div>
        <div className={wrapperClasses}>
          <label className={labelClasses}>List Price</label>
          <Input
            type="number"
            className={inputClasses(mismatch("listPrice"))}
            defaultValue={getFieldDisplayValue("listPrice") ?? undefined}
            onChange={(e) => {
              editField("listPrice", e.target.valueAsNumber);
            }}
          />
        </div>
        <div className={wrapperClasses}>
          <label className={labelClasses}>MAP</label>
          <Input
            type="number"
            className={inputClasses(mismatch("manufacturerAdvertisedPrice"))}
            defaultValue={
              getFieldDisplayValue("manufacturerAdvertisedPrice") ?? undefined
            }
            onChange={(e) => {
              editField("manufacturerAdvertisedPrice", e.target.valueAsNumber);
            }}
            disabled={!allowEditProtected}
          />
        </div>
      </div>
      <div className={wrapperClasses}>
        <label className={labelClasses}>Sort Order</label>
        <Input
          type="number"
          className={inputClasses(mismatch("sortOrder"))}
          defaultValue={getFieldDisplayValue("sortOrder")}
          onChange={(e) => {
            editField("sortOrder", e.target.valueAsNumber);
          }}
        />
      </div>
    </div>
  );
}

export function DialogProductEditor({
  productCfId,
  backOnClose = false,
}: {
  productCfId: number;
  backOnClose?: boolean;
}) {
  const router = useRouter();

  return (
    <Dialog
      defaultOpen={true}
      modal={true}
      onOpenChange={(open) => {
        if (!open && backOnClose) {
          router.back();
        }
      }}
    >
      <DialogContent className="m-auto max-h-[calc(100vh-2rem)] w-3/4 max-w-[120rem] overflow-y-scroll">
        <DialogTitle>Edit Product {productCfId}</DialogTitle>
        <ProductEditor productCfId={productCfId} simplified={true} />
      </DialogContent>
    </Dialog>
  );
}
