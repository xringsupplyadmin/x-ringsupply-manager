import { createTRPCRouter, publicProcedure } from "../../trpc";
import {
  ProductIdentifier,
  ProductSearchIdentifier,
  ProductSearchIdentifiers,
} from "~/server/api/v2/coreforce/types/products";
import {
  getProduct,
  getProductExtraInformation,
  getProducts,
} from "../coreforce/cf-products-api";
import { ProductIssue } from "~/server/api/v2/coreforce/types/issue-reporting";
import { createIssueReport } from "~/server/api/v2/coreforce/cf-issue-reporting";

export const coreforceRouter = createTRPCRouter({
  products: {
    get: publicProcedure
      .input(ProductSearchIdentifier)
      .query(async ({ input }) => {
        return await getProduct(input);
      }),
    getMany: publicProcedure
      .input(ProductSearchIdentifiers)
      .query(async ({ input }) => {
        return await getProducts(input);
      }),
    getExtraInformation: publicProcedure
      .input(ProductIdentifier)
      .query(async ({ input }) => {
        return await getProductExtraInformation(input);
      }),
    search: publicProcedure.query(async () => {
      throw new Error("Not implemented");
    }),
  },
  issueReporting: {
    create: publicProcedure.input(ProductIssue).mutation(async ({ input }) => {
      return await createIssueReport(input);
    }),
  },
});
