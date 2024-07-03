import { createClient } from "@libsql/client";
import { PrismaLibSQL } from "@prisma/adapter-libsql";
import { PrismaClient } from "@prisma/client";
import { SeedPrisma } from "@snaplet/seed/adapter-prisma";
import { defineConfig } from "@snaplet/seed/config";

export default defineConfig({
  adapter: () => {
    const libsql = createClient({
      url: `${process.env.TURSO_DATABASE_URL}`,
      authToken: `${process.env.TURSO_AUTH_TOKEN}`,
    });
    const adapter = new PrismaLibSQL(libsql);
    const client = new PrismaClient({
      adapter,
      log: ["query", "error", "warn"],
    });
    return new SeedPrisma(client);
  },
  select: ["!*_prisma_migrations"],
});
