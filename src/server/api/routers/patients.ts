import { PATIENT_STATUSES } from "@/lib/consts";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { randomUUID } from "crypto";
import dayjs from "dayjs";
import { z } from "zod";
// Trim whitespace and capitalize the first letter
const nameTransformer = (val: string) => {
  let res = val.trim();
  return res.charAt(0).toUpperCase() + res.slice(1);
};
const patientEditUpdateSchema = z.object({
  firstName: z.string().min(1).transform(nameTransformer),
  middleName: z.string().min(1).transform(nameTransformer),
  lastName: z.string().min(1).transform(nameTransformer),
  dob: z
    .string()
    .regex(/(0[1-9]|1[1,2])(\/|-)(0[1-9]|[12][0-9]|3[01])(\/|-)(19|20)\d{2}/, {
      message: "Must be in the form mm/dd/yyyy",
    })
    // convert to YYYY-MM-DD for easier sorting
    .transform((val) => {
      return dayjs(val).format("YYYY-MM-DD");
    }),
  status: z.enum(PATIENT_STATUSES),
});

export const patientRouter = createTRPCRouter({
  create: publicProcedure
    .input(patientEditUpdateSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.db.patient.create({
        data: { ...input, id: randomUUID() },
      });
    }),

  update: publicProcedure
    .input(patientEditUpdateSchema.and(z.object({ id: z.string() })))
    .mutation(async ({ ctx, input }) => {
      const { id, ...rest } = input;
      return ctx.db.patient.update({
        data: rest,
        where: { id },
      });
    }),

  list: publicProcedure
    .input(
      z
        .object({
          sort: z.object({
            field: z.enum(["name", "age", "status"]),
            direction: z.enum(["asc", "desc"]),
          }),
        })
        .nullish(),
    )
    .query(async ({ ctx, input }) => {
      let orderBy;
      switch (input?.sort.field) {
        case "name":
          orderBy = { lastName: input?.sort.direction };
          break;
        case "age":
          orderBy = {
            dob:
              input?.sort.direction === "desc"
                ? ("asc" as const)
                : ("desc" as const),
          };
          break;
        case "status":
          orderBy = { status: input?.sort.direction };
          break;
        default:
          orderBy = { lastName: "desc" } as const;
      }
      const patients = await ctx.db.patient.findMany({
        orderBy,
      });

      return patients.map((patient) => ({
        name: `${patient.lastName}, ${patient.firstName}`,
        age: dayjs().diff(patient.dob, "year"),
        status: z.enum(PATIENT_STATUSES).parse(patient.status),
        id: patient.id,
      }));
    }),
  getById: publicProcedure.input(z.string()).query(async ({ ctx, input }) => {
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
      dob: dayjs(patient.dob).format("MM/DD/YYYY"),
    };
  }),
});
