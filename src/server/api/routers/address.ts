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
      const { isPrimary, ...rest } = input;
      const newAddress = await ctx.db.address.create({
        data: {
          ...rest,
          line2: input.line2 || "",
        },
      });

      if (isPrimary) {
        await ctx.db.patient.update({
          where: { id: input.patientId },
          data: { primaryAddressId: newAddress.id },
        });
      }
      return newAddress;
    }),
  update: publicProcedure
    .input(
      z.object({
        id: z.string(),
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
      const { isPrimary, ...rest } = input;
      const newAddress = await ctx.db.address.update({
        data: {
          ...rest,
          line2: input.line2 || "",
        },
        where: { id: input.id },
        include: {
          patient: {
            include: { addresses: true },
          },
        },
      });

      if (isPrimary) {
        await ctx.db.patient.update({
          where: { id: newAddress.patientId },
          data: { primaryAddressId: newAddress.id },
        });
      } else if (newAddress.patient.primaryAddressId === newAddress.id) {
        // Just find another address and make it the primary
        const newPrimaryAddress = newAddress.patient.addresses.find(
          (address) => address.id !== newAddress.id,
        );

        await ctx.db.patient.update({
          where: { id: newAddress.patientId },
          data: {
            primaryAddressId: newPrimaryAddress?.id || null,
          },
        });
      }
      return newAddress;
    }),
  delete: publicProcedure.input(z.string()).mutation(async ({ ctx, input }) => {
    const deletedAddress = await ctx.db.address.delete({
      where: { id: input },
      include: {
        patient: {
          include: { addresses: true },
        },
      },
    });

    if (deletedAddress.patient.primaryAddressId === deletedAddress.id) {
      await ctx.db.patient.update({
        where: { id: deletedAddress.patient.id },
        data: {
          primaryAddressId: deletedAddress.patient.addresses[0]?.id || null,
        },
      });
    }
  }),
});
