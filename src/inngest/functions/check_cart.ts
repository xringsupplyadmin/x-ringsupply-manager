import { inngest } from "../client";

export const checkCart = inngest.createFunction(
  {
    id: "checkCart",
  },
  { event: "retailStore/check.cart" },
  async ({ event, step }) => {
    return { event, body: "Hello World!" };
  },
);
