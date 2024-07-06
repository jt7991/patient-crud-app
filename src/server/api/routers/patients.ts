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
    .regex(/^(0[1-9]|1[0-2])\/(0[1-9]|1\d|2\d|3[01])\/(19|20)\d{2}$/, {
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
              field: z.enum(["name", "dob", "city", "status"]),
              direction: z.enum(["asc", "desc"]),
            })
            .optional(),
          filter: z
            .object({
              status: z.enum([...PATIENT_STATUSES, "all"]).optional(),
              name: z.string().optional(),
              city: z.string().optional(),
              dob: z
                .object({
                  date: z
                    .string()
                    .transform((val) => dayjs(val).format("YYYY-MM-DD")),
                  operator: z
                    .enum(["Before", "After", "On"])
                    .transform((val) => {
                      if (val === "Before") {
                        return "lt" as const;
                      }
                      if (val === "After") {
                        return "gt" as const;
                      }
                      return "equals" as const;
                    }),
                })
                .optional(),
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
        case "dob":
          orderBy = { dob: input.sort.direction };
          break;
        case "status":
          orderBy = { status: input.sort.direction };
          break;
        case "city":
          orderBy = { primaryAddress: { city: input.sort.direction } };
          break;
        default:
          orderBy = { lastName: "desc" } as const;
      }

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
          // Search is case sensitive
          primaryAddress: input?.filter?.city
            ? { city: { contains: input?.filter?.city } }
            : undefined,
          dob: input?.filter?.dob
            ? { [input.filter.dob.operator]: input.filter.dob.date }
            : undefined,
        },
        include: { primaryAddress: { select: { city: true } } },
      });

      return patients.map((patient) => ({
        name: `${patient.lastName}, ${patient.firstName}`,
        dob: dayjs(patient.dob).format("MM/DD/YYYY"),
        status: z.enum(PATIENT_STATUSES).parse(patient.status),
        id: patient.id,
        city: patient.primaryAddress?.city || "",
      }));
    }),

  getById: publicProcedure.input(z.string()).query(async ({ ctx, input }) => {
    const patient = await ctx.db.patient.findUnique({
      where: { id: input },
      include: { addresses: true },
    });

    const additionalInfo = await ctx.db.additionalField.findMany({
      include: {
        additionalFieldResponses: {
          where: { patientId: input },
          take: 1,
        },
      },
      where: { deleted: false },
      orderBy: { createdAt: "asc" },
    });

    const addresses = patient?.addresses.map((address) => ({
      id: address.id,
      line1: address.line1,
      line2: address.line2,
      city: address.city,
      state: address.state,
      zip: address.zip,
      isPrimary: address.id === patient.primaryAddressId,
    }));

    const additionalInfoCleaned = additionalInfo.map((entry) => ({
      id: entry.id,
      name: entry.name,
      value: entry.additionalFieldResponses[0]?.value || "",
      type: entry.type,
    }));

    if (!patient) {
      return null;
    }

    return {
      ...patient,
      addresses,
      // Parse the status to ensure it's valid. Sqlite doesn't have enum support
      status: z.enum(PATIENT_STATUSES).parse(patient?.status),
      dob: dayjs(patient.dob).format("MM/DD/YYYY"),
      additionalInfo: additionalInfoCleaned,
    };
  }),
  updateAdditionalInfo: publicProcedure
    .input(
      z.object({
        patientId: z.string(),
        data: z.record(z.string(), z.string().or(z.undefined())),
      }),
    )
    .mutation(({ ctx, input }) => {
      return ctx.db.additionalFieldResponse.createMany({
        data: Object.entries(input.data).map(([fieldId, value]) => ({
          value: value || "",
          fieldId,
          patientId: input.patientId,
        })),
      });
    }),
});
