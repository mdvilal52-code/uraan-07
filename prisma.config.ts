import fs from "node:fs";
import path from "node:path";
import { defineConfig } from "prisma/config";

// A Prisma config file turns OFF Prisma's automatic `.env` loading, so load it
// ourselves for local commands (`prisma migrate dev`, `prisma db seed`,
// `prisma studio`). On Vercel / Render the connection string is injected as a
// real environment variable and no `.env` file exists — hence the guard.
const envFile = path.join(process.cwd(), ".env");
if (fs.existsSync(envFile)) {
  process.loadEnvFile(envFile);
}

export default defineConfig({
  schema: path.join("prisma", "schema.prisma"),
  migrations: {
    // Preserves `prisma db seed` (used by render.yaml) and `prisma migrate
    // reset` after the config moved out of package.json's `prisma` key.
    seed: "tsx prisma/seed.ts",
  },
});
