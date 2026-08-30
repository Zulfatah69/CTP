-- Fix BookingState enum: replace DISPOSITION_REQUESTED with REVISION_NEEDED
-- Add missing fields to Booking model

-- Step 1: Add new enum value
ALTER TYPE "BookingState" ADD VALUE IF NOT EXISTS 'REVISION_NEEDED';

-- Step 2: Update any existing DISPOSITION_REQUESTED records (if any) to UNDER_REVIEW
UPDATE "Booking" SET "state" = 'UNDER_REVIEW' WHERE "state" = 'DISPOSITION_REQUESTED';

-- Step 3: Remove old enum value (PostgreSQL requires recreating the type)
-- Rename old type
ALTER TYPE "BookingState" RENAME TO "BookingState_old";

-- Create new type without DISPOSITION_REQUESTED
CREATE TYPE "BookingState" AS ENUM ('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'REVISION_NEEDED', 'APPROVED', 'WAITING_PAYMENT', 'ACTIVE', 'COMPLETED', 'CANCELLED', 'REJECTED');

-- Alter the column to use new type (must drop default first)
ALTER TABLE "Booking" ALTER COLUMN "state" DROP DEFAULT;
ALTER TABLE "Booking" ALTER COLUMN "state" TYPE "BookingState" USING "state"::text::"BookingState";
ALTER TABLE "Booking" ALTER COLUMN "state" SET DEFAULT 'DRAFT'::"BookingState";

-- Drop old type
DROP TYPE "BookingState_old";

-- Step 4: Add missing columns to Booking
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "attendeesDescription" TEXT;
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "activityPurpose" TEXT;
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "activityDescription" TEXT;
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "applicantCategory" "ApplicantCategory";
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "revisionNote" TEXT;
