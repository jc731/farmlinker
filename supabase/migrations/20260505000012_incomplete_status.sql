-- Add 'incomplete' to the profile status enum.
-- Must be in its own migration — Postgres commits ADD VALUE immediately,
-- but the new value isn't visible to subsequent statements in the same transaction.
ALTER TYPE public.profile_status ADD VALUE IF NOT EXISTS 'incomplete';
