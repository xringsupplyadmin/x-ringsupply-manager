import { inngest } from "../../inngest";
import e from "@/dbschema/edgeql-js";
import client from "~/server/db/client";

const importProducts = inngest.createFunction(
  {
    id: "importProducts",
    name: "Import Products",
  },
  { event: "ecommerce/import/products" },
  async ({ event, step }) => {
    for (const product of event.data.products) {
      await step.run(`import-product-${product.cfId}`, async () => {
        await e
          .insert(e.ecommerce.Product, product)
          .unlessConflict((record) => ({
            on: record.code,
            else: e.update(record, () => ({
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
