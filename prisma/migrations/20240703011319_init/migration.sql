/*
  Warnings:

  - You are about to drop the column `value` on the `AdditionalField` table. All the data in the column will be lost.
  - Added the required column `name` to the `AdditionalField` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_AdditionalField" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_AdditionalField" ("createdAt", "id", "type", "updatedAt") SELECT "createdAt", "id", "type", "updatedAt" FROM "AdditionalField";
DROP TABLE "AdditionalField";
ALTER TABLE "new_AdditionalField" RENAME TO "AdditionalField";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
