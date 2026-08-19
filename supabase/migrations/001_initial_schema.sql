create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  age integer,
  sex text check (sex in ('male', 'female')),
  weight_kg decimal(6,2),
  diet_type text default 'omnivore',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.nutrients (
  id serial primary key,
  name text not null unique,
  unit_name text not null,
  nutrient_nbr text unique,
  category text not null check (category in ('macronutrient', 'vitamin', 'mineral', 'other'))
);

create table public.foods (
  id serial primary key,
  fdc_id text unique,
  name text not null,
  data_type text default 'seed' check (data_type in ('seed', 'usda', 'custom', 'recipe')),
  brand_owner text,
  category text,
  created_at timestamptz default now()
);

create table public.serving_sizes (
  id serial primary key,
  food_id integer not null references public.foods(id) on delete cascade,
  amount decimal(10,4) not null,
  unit_name text not null,
  gram_weight decimal(10,4) not null,
  is_default boolean default false
);

create table public.food_nutrients (
  id serial primary key,
  food_id integer not null references public.foods(id) on delete cascade,
  nutrient_id integer not null references public.nutrients(id) on delete cascade,
  amount decimal(12,6) not null,
  unique (food_id, nutrient_id)
);

create table public.log_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  food_id integer not null references public.foods(id),
  serving_size_id integer references public.serving_sizes(id),
  logged_amount decimal(10,4) not null,
  logged_unit text not null,
  gram_equivalent decimal(10,4) not null,
  meal text check (meal in ('breakfast', 'lunch', 'dinner', 'snack')),
  logged_date date not null default current_date,
  logged_at timestamptz default now(),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.daily_summaries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  nutrient_id integer not null references public.nutrients(id),
  total_amount decimal(12,4) not null,
  unit_name text not null,
  updated_at timestamptz default now(),
  unique (user_id, date, nutrient_id)
);

create table public.user_targets (
  id serial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  nutrient_id integer not null references public.nutrients(id),
  min_amount decimal(12,4),
  max_amount decimal(12,4),
  unit_name text not null,
  unique (user_id, nutrient_id)
);

create index idx_foods_name on public.foods(name);
create index idx_foods_category on public.foods(category);
create index idx_serving_sizes_food_id on public.serving_sizes(food_id);
create index idx_food_nutrients_food_id on public.food_nutrients(food_id);
create index idx_log_entries_user_date on public.log_entries(user_id, logged_date);
create index idx_daily_summaries_user_date on public.daily_summaries(user_id, date);
create index idx_user_targets_user_id on public.user_targets(user_id);

alter table public.profiles enable row level security;
alter table public.nutrients enable row level security;
alter table public.foods enable row level security;
alter table public.serving_sizes enable row level security;
alter table public.food_nutrients enable row level security;
alter table public.log_entries enable row level security;
alter table public.daily_summaries enable row level security;
alter table public.user_targets enable row level security;

create policy "Foods are viewable by everyone" on public.foods
  for select using (true);

create policy "Nutrients are viewable by everyone" on public.nutrients
  for select using (true);

create policy "Food nutrients are viewable by everyone" on public.food_nutrients
  for select using (true);

create policy "Serving sizes are viewable by everyone" on public.serving_sizes
  for select using (true);

create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "Users can insert own profile" on public.profiles
  for insert with check (auth.uid() = id);

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

create policy "Users can view own log entries" on public.log_entries
  for select using (auth.uid() = user_id);

create policy "Users can insert own log entries" on public.log_entries
  for insert with check (auth.uid() = user_id);

create policy "Users can update own log entries" on public.log_entries
  for update using (auth.uid() = user_id);

create policy "Users can delete own log entries" on public.log_entries
  for delete using (auth.uid() = user_id);

create policy "Users can view own daily summaries" on public.daily_summaries
  for select using (auth.uid() = user_id);

create policy "Users can insert own daily summaries" on public.daily_summaries
  for insert with check (auth.uid() = user_id);

create policy "Users can update own daily summaries" on public.daily_summaries
  for update using (auth.uid() = user_id);

create policy "Users can delete own daily summaries" on public.daily_summaries
  for delete using (auth.uid() = user_id);

create policy "Users can view own targets" on public.user_targets
  for select using (auth.uid() = user_id);

create policy "Users can insert own targets" on public.user_targets
  for insert with check (auth.uid() = user_id);

create policy "Users can update own targets" on public.user_targets
  for update using (auth.uid() = user_id);

create policy "Users can delete own targets" on public.user_targets
  for delete using (auth.uid() = user_id);

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.update_updated_at_column();

create trigger update_log_entries_updated_at
  before update on public.log_entries
  for each row execute procedure public.update_updated_at_column();
