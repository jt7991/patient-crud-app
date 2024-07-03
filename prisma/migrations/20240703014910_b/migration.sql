-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_AdditionalField" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_AdditionalField" ("createdAt", "id", "name", "type", "updatedAt") SELECT "createdAt", "id", "name", "type", "updatedAt" FROM "AdditionalField";
DROP TABLE "AdditionalField";
ALTER TABLE "new_AdditionalField" RENAME TO "AdditionalField";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
