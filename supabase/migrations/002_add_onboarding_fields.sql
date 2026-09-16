-- Add new fields to profiles table for onboarding
alter table public.profiles add column if not exists first_name text;
alter table public.profiles add column if not exists height_cm decimal(5,2);
alter table public.profiles add column if not exists activity_level text check (activity_level in ('sedentary', 'lightly_active', 'moderately_active', 'very_active', 'custom'));
alter table public.profiles add column if not exists weight_goal_kg decimal(6,2);
alter table public.profiles add column if not exists goal_rate_kg_per_week decimal(4,2);
alter table public.profiles add column if not exists onboarding_completed boolean default false;

-- Add calorie target to user_targets or create a separate table
-- We'll store the calculated calorie target in user_targets with nutrient_id = 1 (Calories)
