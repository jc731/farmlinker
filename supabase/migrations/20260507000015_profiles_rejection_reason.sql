-- Add rejection_reason to profiles (mirrors the field already on listings)
alter table profiles add column if not exists rejection_reason text;
