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
import { Label } from "~/components/ui/label";
import { RequiredFieldsIntro } from "~/components/form-components";
import {
  type CoreforceProduct,
  type ProductExtraInformation,
} from "~/server/api/v2/coreforce/types/products";
import { US_StateMap } from "~/server/api/v2/types/geography";
import {
  isExtraRequired,
  isIssueType,
  IssueType,
  ProductIssue,
} from "~/server/api/v2/coreforce/types/issue-reporting";
import { api } from "~/trpc/react";
import { Spinner } from "~/components/spinner";

const IssueDescriptions: Record<IssueType, string> = {
  Description: "Missing/Inaccurate Product Description",
  Title: "Inaccurate/Ambiguous Product Title",
  Image: "Missing/Inaccurate Product Image",
  StateRestriction: "Incorrect State Restriction",
  Other: "Other Issue",
} as const;

const IssueExtraTitle: Record<IssueType, string> = {
  Description: "What is missing or inaccurate in the product description?",
  Title: "What is inaccurate or ambiguous in the product title?",
  Image: "What is missing or inaccurate in the product image?",
  StateRestriction: "What is incorrect about the state restriction?",
  Other: "Please describe the issue in detail.",
} as const;

const StateOptions = Object.entries(US_StateMap).map(([key, value]) => ({
  label: value,
  value: key,
}));

const IssueTypeOptions = IssueType.options.map((n) => ({
  label: IssueDescriptions[n],
  value: n,
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
  const [reportId, setReportId] = useState("");
  const { mutate: createReport, isPending } =
    api.v2.coreforce.issueReporting.create.useMutation();
  const form = useAppForm({
    defaultValues: {
      productId: product.product_id,
      issueType: "" as IssueType,
      email: "",
      stateRestrictionCurrent: extraInformation.restricted_states,
      stateRestrictionUpdated: extraInformation.restricted_states,
      extra: "",
    } as ProductIssue,
    validators: {
      onChange: ProductIssue,
    },
    onSubmit: async ({ value }) => {
      console.log(value);
      createReport(value, {
        onSuccess(data) {
          setReportId(data.id);
          setDialogOpen(true);
        },
        onError(err) {
          console.error(err);
          toast({
            title: "Something went wrong",
            description:
              "There was an error submitting your report. Please try again later or contact an administrator.",
            variant: "destructive",
          });
        },
      });
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
              Report ID {reportId}
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
              options={IssueTypeOptions}
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
              {issueType === "StateRestriction" && (
                <form.AppField name={"stateRestrictionUpdated"}>
                  {(field) => (
                    <>
                      <field.MultiSelectField
                        label={"Select states where this product is restricted"}
                        placeholder={"Select states"}
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
                    required={isExtraRequired(issueType)}
                    label={"Additional Information"}
                    placeholder={
                      IssueExtraTitle[
                        isIssueType(issueType) ? issueType : "Other"
                      ]
                    }
                  />
                )}
              </form.AppField>
            </>
          )}
        </form.Subscribe>
        <form.AppForm>
          <form.SubmitButton disabled={isPending}>
            {isPending ? <Spinner /> : "Submit Issue"}
          </form.SubmitButton>
        </form.AppForm>
      </form>
    </>
  );
}
