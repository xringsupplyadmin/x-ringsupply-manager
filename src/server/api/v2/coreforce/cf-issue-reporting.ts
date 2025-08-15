import { qb } from "@/dbschema/query_builder";
import { type ProductIssue } from "~/server/api/v2/coreforce/types/issue-reporting";
import client from "~/server/db/client";

export async function createIssueReport(issue: ProductIssue) {
  return await qb.insert(qb.coreforce.ProductIssue, issue).run(client);
}
