create extension if not exists pgcrypto;

-- Enums
do $$
begin
  if not exists (select 1 from pg_type where typname = 'product_category') then
    create type public.product_category as enum ('grocery', 'electronics', 'cabs');
  end if;
end $$;

-- user_profiles
create table if not exists public.user_profiles (
  user_id      uuid        primary key references auth.users(id) on delete cascade,
  display_name text,
  city         text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- products
create table if not exists public.products (
  id          text        primary key,
  title       text        not null,
  category    public.product_category not null,
  subtitle    text,
  image_url   text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- watchlist
create table if not exists public.watchlist (
  id          uuid        primary key default gen_random_uuid(),
  user_id     uuid        not null default auth.uid()
                          references auth.users(id) on delete cascade,
  product_id  text        not null references public.products(id) on delete cascade,
  city        text        not null,
  created_at  timestamptz not null default now(),
  unique (user_id, product_id, city)
);
create index if not exists watchlist_user_id_idx     on public.watchlist(user_id);
create index if not exists watchlist_product_city_idx on public.watchlist(product_id, city);

-- alerts
create table if not exists public.alerts (
  id                uuid        primary key default gen_random_uuid(),
  user_id           uuid        not null default auth.uid()
                                references auth.users(id) on delete cascade,
  product_id        text        not null references public.products(id) on delete cascade,
  city              text        not null,
  platform_id       text,
  target_price      numeric     not null check (target_price >= 0),
  is_active         boolean     not null default true,
  created_at        timestamptz not null default now(),
  last_triggered_at timestamptz
);
create index if not exists alerts_user_id_idx     on public.alerts(user_id);
create index if not exists alerts_product_city_idx on public.alerts(product_id, city);
create index if not exists alerts_active_idx       on public.alerts(is_active) where is_active = true;

-- price_history
create table if not exists public.price_history (
  id          uuid        primary key default gen_random_uuid(),
  product_id  text        not null references public.products(id) on delete cascade,
  city        text        not null,
  platform_id text        not null,
  price       numeric     not null check (price >= 0),
  recorded_at timestamptz not null default now()
);
create index if not exists price_history_lookup_idx
  on public.price_history(product_id, city, platform_id, recorded_at desc);
create index if not exists price_history_chart_idx
  on public.price_history(product_id, city, recorded_at desc);

-- Row Level Security
alter table public.user_profiles  enable row level security;
alter table public.watchlist       enable row level security;
alter table public.alerts          enable row level security;
alter table public.price_history   enable row level security;
alter table public.products        enable row level security;

-- user_profiles policies
create policy "profiles_select_own" on public.user_profiles
  for select using (auth.uid() = user_id);
create policy "profiles_insert_own" on public.user_profiles
  for insert with check (auth.uid() = user_id);
create policy "profiles_update_own" on public.user_profiles
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- watchlist policies
create policy "watchlist_select_own" on public.watchlist
  for select using (auth.uid() = user_id);
create policy "watchlist_insert_own" on public.watchlist
  for insert with check (auth.uid() = user_id);
create policy "watchlist_delete_own" on public.watchlist
  for delete using (auth.uid() = user_id);

-- alerts policies
create policy "alerts_select_own" on public.alerts
  for select using (auth.uid() = user_id);
create policy "alerts_insert_own" on public.alerts
  for insert with check (auth.uid() = user_id);
create policy "alerts_update_own" on public.alerts
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "alerts_delete_own" on public.alerts
  for delete using (auth.uid() = user_id);

-- price_history: public read, service-role write
create policy "price_history_public_read" on public.price_history
  for select using (true);
create policy "price_history_service_write" on public.price_history
  for insert with check (auth.role() = 'service_role');

-- products: public read, service-role write
create policy "products_public_read" on public.products
  for select using (true);
create policy "products_service_write" on public.products
  for insert with check (auth.role() = 'service_role');
create policy "products_service_update" on public.products
  for update using (auth.role() = 'service_role');
