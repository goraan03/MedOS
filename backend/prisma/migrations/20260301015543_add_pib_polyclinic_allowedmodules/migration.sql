/*
  Warnings:

  - You are about to drop the column `specialties` on the `clinic_users` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `clinic_users` table. All the data in the column will be lost.
  - The `permissions` column on the `clinic_users` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[pib]` on the table `clinics` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "clinic_modules" ADD COLUMN     "enabledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "clinic_users" DROP COLUMN "specialties",
DROP COLUMN "updatedAt",
ADD COLUMN     "allowedModules" TEXT[] DEFAULT ARRAY[]::TEXT[],
DROP COLUMN "permissions",
ADD COLUMN     "permissions" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "clinics" ADD COLUMN     "isPolyclinic" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "pib" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "clinics_pib_key" ON "clinics"("pib");
