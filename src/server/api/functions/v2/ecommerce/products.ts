import { qb } from "@/dbschema/query_builder";
import { inngest } from "../../../inngest";
import client from "~/server/db/client";

export const importProducts = inngest.createFunction(
  {
    id: "importProducts",
    name: "Import Products",
  },
  { event: "ecommerce/import/products" },
  async ({ event, step }) => {
    for (const product of event.data.products) {
      await step.run(`import-product-${product.cfId}`, async () => {
        await qb
          .insert(qb.ecommerce.Product, product)
          .unlessConflict((record) => ({
            on: record.code,
            else: qb.update(record, () => ({
              set: product,
            })),
          }))
          .run(client);
      });
    }
  },
);

const functions = [importProducts];
export default functions;
