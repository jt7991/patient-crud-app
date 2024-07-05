import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";

export const addressRouter = createTRPCRouter({
  create: publicProcedure
    .input(
      z.object({
        patientId: z.string(),
        line1: z.string(),
        line2: z.string().optional(),
        city: z.string(),
        state: z.string(),
        zip: z.string().regex(/^\d{5}$/),
        isPrimary: z
          .enum(["Yes", "No"])
          .transform((value) => (value === "Yes" ? true : false)),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const newAddress = await ctx.db.address.create({
        data: {
          ...input,
          line2: input.line2 || "",
        },
      });

      if (input.isPrimary) {
        await ctx.db.patient.update({
          where: { id: input.patientId },
          data: { primaryAddressId: newAddress.id },
        });
      }
      return newAddress;
    }),
});
