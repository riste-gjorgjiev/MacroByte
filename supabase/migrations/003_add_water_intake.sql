-- Water intake tracking table
create table public.water_intake (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  amount_ml integer not null,
  logged_date date not null default current_date,
  logged_at timestamptz default now(),
  created_at timestamptz default now()
);

-- Index for performance
create index idx_water_intake_user_date on public.water_intake(user_id, logged_date);

-- Enable RLS
alter table public.water_intake enable row level security;

-- RLS Policies
create policy "Users can view own water intake" on public.water_intake
  for select using (auth.uid() = user_id);

create policy "Users can insert own water intake" on public.water_intake
  for insert with check (auth.uid() = user_id);

create policy "Users can delete own water intake" on public.water_intake
  for delete using (auth.uid() = user_id);

-- Add water goal to profiles
alter table public.profiles add column if not exists water_goal_ml integer default 2000;
