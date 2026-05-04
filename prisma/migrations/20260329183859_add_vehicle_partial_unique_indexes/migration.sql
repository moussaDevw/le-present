-- Partial unique index on chassis
-- Prevents two active vehicles from having the same chassis number
-- Prisma doesn't support partial indexes (WHERE clause), hence manual SQL
CREATE UNIQUE INDEX "Vehicle_chassis_unique"
ON "Vehicle"("chassis")
WHERE "chassis" IS NOT NULL AND "deletedAt" IS NULL;

-- Partial unique index on licensePlate
-- Prevents two active vehicles from having the same license plate
CREATE UNIQUE INDEX "Vehicle_licensePlate_unique"
ON "Vehicle"("licensePlate")
WHERE "licensePlate" IS NOT NULL AND "deletedAt" IS NULL;