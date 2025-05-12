import { createTRPCRouter } from "../../trpc";
import { klaviyoRouter } from "./klaviyo";

export const v2root = createTRPCRouter({
  klaviyo: klaviyoRouter,
});
