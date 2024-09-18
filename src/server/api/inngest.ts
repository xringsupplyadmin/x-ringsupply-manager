import { EventSchemas, Inngest } from "inngest";
import emailsSchema from "./schemas/emails";
import retailstoreSchema from "./schemas/retailstore";
import ecommerceSchema from "./schemas/ecommerce";

// Create a client to send and receive events
export const inngest = new Inngest({
  id: "x-ring-supply",
  schemas: new EventSchemas().fromZod([
    ...retailstoreSchema,
    ...emailsSchema,
    ...ecommerceSchema,
  ]),
});
