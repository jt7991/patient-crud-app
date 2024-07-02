/**
 * ! Executing this script will delete all data in your database and seed it with 10 patient.
 * ! Make sure to adjust the script to your needs.
 * Use any TypeScript runner to run this script, for example: `npx tsx seed.ts`
 * Learn more about the Seed Client by following our guide: https://docs.snaplet.dev/seed/getting-started
 */
import { PATIENT_STATUSES } from "@/lib/consts";
import { createSeedClient } from "@snaplet/seed";

const main = async () => {
  const seed = await createSeedClient({
    models: {
      patient: {
        data: {
          queryName: (ctx) =>
            `${ctx.data.firstName?.toLowerCase()}${ctx.data.lastName?.toLowerCase()}`,
          status: (_) =>
            PATIENT_STATUSES[
              Math.floor(Math.random() * PATIENT_STATUSES.length)
            ]!,
        },
      },
    },
  });

  // Truncate all tables in the database
  await seed.$resetDatabase();

  await seed.additionalFieldResponse((x) => x(100));

  // Type completion not working? You might want to reload your TypeScript Server to pick up the changes
  console.log("Database seeded successfully!");

  process.exit();
};

main();
