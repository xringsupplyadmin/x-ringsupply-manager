import { createTRPCRouter } from "../../trpc";
import { klaviyoCatalogRouter } from "./klaviyo/catalog";
import { klaviyoEventsRouter } from "./klaviyo/events";

export const klaviyoRouter = createTRPCRouter({
  events: klaviyoEventsRouter,
  catalog: klaviyoCatalogRouter,
});
