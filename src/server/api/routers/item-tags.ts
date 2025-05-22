import { createTRPCRouter, moduleProcedure } from "../trpc";

const procedure = moduleProcedure(["ItemTags"]);

export const itemTagsRouter = createTRPCRouter({
  itemTags: {
    get: procedure.query(async () => {}),
    create: procedure.mutation(async () => {}),
    update: procedure.mutation(async () => {}),
    delete: procedure.mutation(async () => {}),
  },
});
