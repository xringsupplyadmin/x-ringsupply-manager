import { createTRPCRouter } from "../../trpc";
import { coreforceRouter } from "./coreforce";
import { klaviyoRouter } from "./klaviyo";
import { adminRouter } from "./admin";

export const v2root = createTRPCRouter({
  klaviyo: klaviyoRouter,
  admin: adminRouter,
  coreforce: coreforceRouter,
});
