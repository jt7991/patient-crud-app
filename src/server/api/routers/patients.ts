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

// This will be used for searching
const getFullName = (first: string, last: string) => {
  return `${first.toLowerCase()}${last.toLowerCase()}`;
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
        data: {
          ...input,
          id: randomUUID(),
          queryName: getFullName(input.firstName, input.lastName),
        },
      });
    }),

  update: publicProcedure
    .input(patientEditUpdateSchema.and(z.object({ id: z.string() })))
    .mutation(async ({ ctx, input }) => {
      const { id, ...rest } = input;
      return ctx.db.patient.update({
        data: {
          ...rest,
          queryName: getFullName(input.firstName, input.lastName),
        },
        where: { id },
      });
    }),

  list: publicProcedure
    .input(
      z
        .object({
          sort: z
            .object({
              field: z.enum(["name", "age", "status"]),
              direction: z.enum(["asc", "desc"]),
            })
            .optional(),
          filter: z
            .object({
              status: z.enum([...PATIENT_STATUSES, "all"]).optional(),
              name: z.string().optional(),
            })
            .optional(),
        })
        .nullish(),
    )
    .query(async ({ ctx, input }) => {
      let orderBy;
      switch (input?.sort?.field) {
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

      console.log("name", input?.filter?.name);

      const patients = await ctx.db.patient.findMany({
        orderBy,
        where: {
          status:
            !input?.filter?.status || input?.filter?.status === "all"
              ? undefined
              : input?.filter?.status,
          queryName: input?.filter?.name
            ? { contains: input?.filter?.name.toLowerCase().replace(/\s/g, "") }
            : undefined,
        },
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
