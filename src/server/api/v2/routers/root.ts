import { createTRPCRouter } from "../../trpc";
import { klaviyoRouter } from "./klaviyo";
import { adminRouter } from "~/server/api/v2/routers/admin";

export const v2root = createTRPCRouter({
  klaviyo: klaviyoRouter,
  admin: adminRouter,
});
