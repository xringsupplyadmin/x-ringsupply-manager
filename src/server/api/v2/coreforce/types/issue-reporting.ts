import z from "zod/v4";

export const IssueType = z.enum(
  ["Description", "Title", "Image", "StateRestriction", "Other"],
  {
    error: "Please select a valid issue type",
  },
);
export type IssueType = z.infer<typeof IssueType>;

const ExtraRequired = IssueType.extract(["StateRestriction", "Other"]);
type ExtraRequired = z.infer<typeof ExtraRequired>;

export function isIssueType(value: unknown): value is IssueType {
  return IssueType.options.includes(value as IssueType);
}

export function isExtraRequired(issueType: IssueType) {
  return ExtraRequired.options.includes(issueType as ExtraRequired);
}

export const ProductIssue = z
  .object({
    productId: z.number(),
    issueType: IssueType,
    email: z
      .email({ error: "Please enter a valid email address" })
      .or(z.literal("")),
    stateRestrictionCurrent: z.string().array(),
    stateRestrictionUpdated: z.string().array().optional(),
    extra: z.string(),
  })
  .refine((o) => !isExtraRequired(o.issueType) || o.extra.length > 0, {
    message: "Please provide details for the issue",
    path: ["extra"],
  });
export type ProductIssue = z.infer<typeof ProductIssue>;
