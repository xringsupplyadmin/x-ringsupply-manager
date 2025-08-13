"use client";

import { useAppForm } from "~/lib/form";
import { cn } from "~/lib/utils";
import { useToast } from "~/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";
import { useState } from "react";
import z from "zod";
import { Label } from "~/components/ui/label";
import { RequiredFieldsIntro } from "~/components/form-components";
import {
  type CoreforceProduct,
  type ProductExtraInformation,
} from "~/server/api/v2/coreforce/types/products";
import { US_StateMap } from "~/server/api/v2/types/geography";

const IssueTypes = [
  "DESCRIPTION",
  "TITLE",
  "IMAGE",
  "STATE_RESTRICTION",
  "OTHER",
] as const;
type IssueType = (typeof IssueTypes)[number];

const IssueDescriptions: Record<IssueType, string> = {
  DESCRIPTION: "Missing/Inaccurate Product Description",
  TITLE: "Inaccurate/Ambiguous Product Title",
  IMAGE: "Missing/Inaccurate Product Image",
  STATE_RESTRICTION: "Incorrect State Restriction",
  OTHER: "Other Issue",
} as const;

const IssueExtraTitle: Record<IssueType, string> = {
  DESCRIPTION: "What is missing or inaccurate in the product description?",
  TITLE: "What is inaccurate or ambiguous in the product title?",
  IMAGE: "What is missing or inaccurate in the product image?",
  STATE_RESTRICTION: "What is incorrect about the state restriction?",
  OTHER: "Please describe the issue in detail.",
} as const;

function getIssueExtraTitle(issueType: string): string {
  const index = IssueTypes.includes(issueType as IssueType)
    ? (issueType as IssueType)
    : "OTHER";
  const required = index === "OTHER" || index === "STATE_RESTRICTION";
  return `${IssueExtraTitle[index]} ${required ? "(required)" : "(optional)"}`;
}

const ProductIssueInput = z
  .object({
    productId: z.number(),
    issueType: z.enum(IssueTypes, { message: "Please select an issue type" }),
    email: z
      .string()
      .email("Please enter a valid email address")
      .or(z.literal("")),
    stateRestriction: z.string().array(),
    extra: z.string(),
  })
  .refine(
    (o) =>
      (o.issueType !== "OTHER" && o.issueType !== "STATE_RESTRICTION") ||
      o.extra.length > 0,
    {
      message: "Please provide details for the issue",
      path: ["extra"],
    },
  );

const StateOptions = Object.entries(US_StateMap).map(([key, value]) => ({
  label: value,
  value: key,
}));

export function ProductIssueForm({
  product,
  extraInformation,
  className,
}: {
  product: CoreforceProduct;
  extraInformation: ProductExtraInformation;
  className?: string;
}) {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const form = useAppForm({
    defaultValues: {
      productId: product.product_id,
      issueType: "",
      email: "",
      stateRestriction: [] as string[],
      extra: "",
    },
    validators: {
      onChange: ProductIssueInput,
    },
    onSubmit: ({ value }) => {
      console.log(value);
      setDialogOpen(true);
    },
  });

  return (
    <>
      <AlertDialog open={dialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className={"text-center"}>
              Thanks!
            </AlertDialogTitle>
            <AlertDialogDescription>
              We&apos;ve received your report and will review it shortly.
            </AlertDialogDescription>
            <AlertDialogDescription>
              Your feedback helps us improve our site for gun owners everywhere.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className={"items-center gap-2"}>
            <p className={"text-sm italic text-muted-foreground"}>
              Report ID 000000
            </p>
            <div className={"flex-grow basis-0"} />
            <AlertDialogAction onClick={() => setDialogOpen(false)}>
              Close
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <form
        className={cn("flex flex-col gap-4", className)}
        onSubmit={async (e) => {
          e.preventDefault();
          await form.handleSubmit(e);
        }}
      >
        <RequiredFieldsIntro />
        <form.AppField name={"issueType"}>
          {(field) => (
            <field.SelectField
              required
              label={"Issue Type"}
              placeholder={"Select an issue type"}
              options={IssueTypes.map((n) => ({
                label: IssueDescriptions[n],
                value: n,
              }))}
            />
          )}
        </form.AppField>
        <form.AppField name={"email"}>
          {(field) => (
            <>
              <field.InputField
                id={"form-email"}
                placeholder={`Your Email (optional)`}
                label={"Email Address"}
              />
              <Label className={"text-muted-foreground"}>
                Your email will only be used to contact your in relation to this
                report
              </Label>
            </>
          )}
        </form.AppField>
        <form.Subscribe selector={(state) => state.values.issueType}>
          {(issueType) => (
            <>
              {issueType === "STATE_RESTRICTION" && (
                <form.AppField name={"stateRestriction"}>
                  {(field) => (
                    <>
                      <field.MultiSelectField
                        label={"Select states where this product is restricted"}
                        placeholder={"Select states"}
                        defaultValue={extraInformation.restricted_states}
                        options={StateOptions}
                      />
                      <Label className={"text-muted-foreground"}>
                        Please provide additional information about the change
                        in the additional information field below
                      </Label>
                    </>
                  )}
                </form.AppField>
              )}
              <form.AppField name={"extra"}>
                {(field) => (
                  <field.TextareaField
                    required={
                      issueType === "OTHER" || issueType === "STATE_RESTRICTION"
                    }
                    label={"Additional Information"}
                    placeholder={getIssueExtraTitle(issueType)}
                  />
                )}
              </form.AppField>
            </>
          )}
        </form.Subscribe>
        <form.AppForm>
          <form.SubmitButton>Submit Issue</form.SubmitButton>
        </form.AppForm>
      </form>
    </>
  );
}
