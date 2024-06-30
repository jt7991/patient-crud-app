import { PATIENT_STATUSES } from "@/lib/consts";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { z } from "zod";

const patientSchema = z.object({
  firstName: z.string().min(1),
  middleName: z.string().min(1),
  lastName: z.string().min(1),
  dob: z
    .string()
    .regex(/(0[1-9]|1[1,2])(\/|-)(0[1-9]|[12][0-9]|3[01])(\/|-)(19|20)\d{2}/, {
      message: "Must be in the form mm/dd/yyyy",
    }),
  status: z.enum(PATIENT_STATUSES),
});
export const patientRouter = createTRPCRouter({
  create: publicProcedure
    .input(patientSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.db.patient.create({
        data: input,
      });
    }),

  update: publicProcedure
    .input(patientSchema.and(z.object({ id: z.number() })))
    .mutation(async ({ ctx, input }) => {
      const { id, ...rest } = input;
      return ctx.db.patient.update({
        data: rest,
        where: { id },
      });
    }),

  list: publicProcedure.query(({ ctx }) => {
    return ctx.db.patient.findMany({
      orderBy: { lastName: "desc" },
    });
  }),
  getById: publicProcedure
    .input(z.string().pipe(z.coerce.number()))
    .query(async ({ ctx, input }) => {
      const patient = await ctx.db.patient.findUnique({
        where: { id: input },
      });
      if (!patient) {
        return null;
      }

      return {
        ...patient,
        // Parse the status to ensure it's valid. Sqlite doesn't have enum support
        status: z.enum(PATIENT_STATUSES).parse(patient?.status),
      };
    }),
});
