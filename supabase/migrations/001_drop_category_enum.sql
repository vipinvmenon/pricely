-- Migration 001: Replace product_category enum with plain text
-- Run this in the Supabase SQL editor if schema.sql was already applied.

-- 1. Change the column to text (cast existing enum values)
alter table public.products
  alter column category type text using category::text;

-- 2. Set a default so new inserts don't require an explicit category
alter table public.products
  alter column category set default 'electronics';

-- 3. Drop the now-unused enum
drop type if exists public.product_category;
