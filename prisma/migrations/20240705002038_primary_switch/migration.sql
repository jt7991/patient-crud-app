/*
  Warnings:

  - You are about to drop the column `isPrimary` on the `Address` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Address" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "patientId" TEXT NOT NULL,
    "line1" TEXT NOT NULL,
    "line2" TEXT,
    "zip" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Address_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Address" ("city", "createdAt", "id", "line1", "line2", "patientId", "state", "updatedAt", "zip") SELECT "city", "createdAt", "id", "line1", "line2", "patientId", "state", "updatedAt", "zip" FROM "Address";
DROP TABLE "Address";
ALTER TABLE "new_Address" RENAME TO "Address";
CREATE TABLE "new_Patient" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "firstName" TEXT NOT NULL,
    "middleName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "queryName" TEXT NOT NULL,
    "dob" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "primaryAddressId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Patient_primaryAddressId_fkey" FOREIGN KEY ("primaryAddressId") REFERENCES "Address" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Patient" ("createdAt", "dob", "firstName", "id", "lastName", "middleName", "queryName", "status", "updatedAt") SELECT "createdAt", "dob", "firstName", "id", "lastName", "middleName", "queryName", "status", "updatedAt" FROM "Patient";
DROP TABLE "Patient";
ALTER TABLE "new_Patient" RENAME TO "Patient";
CREATE UNIQUE INDEX "Patient_primaryAddressId_key" ON "Patient"("primaryAddressId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
