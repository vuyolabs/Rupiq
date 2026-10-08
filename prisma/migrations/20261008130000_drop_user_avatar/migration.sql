-- Avatars are now initials-only; profile images are no longer stored.
ALTER TABLE "User" DROP COLUMN IF EXISTS "avatar";
