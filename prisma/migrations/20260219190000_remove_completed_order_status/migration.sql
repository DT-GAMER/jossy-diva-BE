/*
  Remove COMPLETED from OrderStatus enum.
  Any existing COMPLETED orders are mapped to PAID.
*/
BEGIN;

-- Ensure no rows keep COMPLETED
UPDATE "Order"
SET "status" = 'PAID'
WHERE "status" = 'COMPLETED';

-- Recreate enum without COMPLETED
CREATE TYPE "OrderStatus_new" AS ENUM ('PENDING_PAYMENT', 'PAID', 'CANCELLED');

-- Drop default before changing type
ALTER TABLE "Order" ALTER COLUMN "status" DROP DEFAULT;

ALTER TABLE "Order"
ALTER COLUMN "status" TYPE "OrderStatus_new"
USING (
  CASE "status"::text
    WHEN 'COMPLETED' THEN 'PAID'
    ELSE "status"::text
  END::"OrderStatus_new"
);

-- Restore default
ALTER TABLE "Order" ALTER COLUMN "status" SET DEFAULT 'PENDING_PAYMENT';

ALTER TYPE "OrderStatus" RENAME TO "OrderStatus_old";
ALTER TYPE "OrderStatus_new" RENAME TO "OrderStatus";
DROP TYPE "public"."OrderStatus_old";

COMMIT;
