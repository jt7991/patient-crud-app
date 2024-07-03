import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";

export const fieldsRouter = createTRPCRouter({
  list: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.additionalField.findMany({
      where: { deleted: false },
      orderBy: { createdAt: "desc" },
    });
  }),
  delete: publicProcedure.input(z.string()).mutation(async ({ ctx, input }) => {
    return ctx.db.additionalField.update({
      data: { deleted: true },
      where: { id: input },
    });
  }),
  create: publicProcedure
    .input(
      z.object({
        name: z.string(),
        type: z.enum(["text", "number"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.additionalField.create({
        data: {
          name: input.name,
          type: input.type,
        },
      });
    }),
});
