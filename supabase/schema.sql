-- UrbanCart Ecommerce - Supabase schema
-- This file matches the current schema used by the UrbanCart application.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  first_name text,
  last_name text,
  email text,
  phone text,
  customer_id text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  sku text unique not null,
  name text not null,
  description text,
  brand text,
  category text not null,
  subcategory text,
  price numeric(12,2) not null check (price >= 0),
  compare_at_price numeric(12,2),
  image_url text,
  sizes text[],
  colors text[],
  stock_quantity integer not null default 0 check (stock_quantity >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  customer_id text,
  full_name text not null,
  phone text,
  address_line1 text not null,
  address_line2 text,
  city text not null,
  state text not null,
  postal_code text not null,
  country text not null default 'India',
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  customer_id text,
  order_number text unique not null,
  status text not null default 'placed'
    check (
      status in (
        'placed',
        'confirmed',
        'processing',
        'shipped',
        'delivered',
        'cancelled'
      )
    ),
  currency text not null default 'INR',
  subtotal numeric(12,2) not null default 0,
  shipping_amount numeric(12,2) not null default 0,
  discount_amount numeric(12,2) not null default 0,
  total numeric(12,2) not null default 0,
  customer_name text,
  customer_email text,
  customer_phone text,
  shipping_address jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  sku text,
  product_name text not null,
  quantity integer not null check (quantity > 0),
  unit_price numeric(12,2) not null check (unit_price >= 0),
  size text,
  color text,
  created_at timestamptz not null default now()
);

create table if not exists public.wishlists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  customer_id text,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint unique_user_product_wishlist
    unique (user_id, product_id)
);

-- Product indexes
create index if not exists idx_products_category
  on public.products(category);

create index if not exists idx_products_brand
  on public.products(brand);

create index if not exists idx_products_active
  on public.products(is_active);

-- Address indexes
create index if not exists idx_addresses_user
  on public.addresses(user_id);

create index if not exists idx_addresses_customer
  on public.addresses(customer_id);

-- Order indexes
create index if not exists idx_orders_user
  on public.orders(user_id);

create index if not exists idx_orders_customer
  on public.orders(customer_id);

create index if not exists idx_orders_created
  on public.orders(created_at desc);

-- Order item indexes
create index if not exists idx_order_items_order
  on public.order_items(order_id);

-- Wishlist indexes
create index if not exists idx_wishlists_user
  on public.wishlists(user_id);

create index if not exists idx_wishlists_customer
  on public.wishlists(customer_id);

-- Enable Row Level Security
alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.addresses enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.wishlists enable row level security;

-- Products are public; customer data is owner-only.

-- Profiles
drop policy if exists "Users can view own profile"
  on public.profiles;

create policy "Users can view own profile"
  on public.profiles
  for select
  to authenticated
  using (auth.uid() = id);

drop policy if exists "Users can insert own profile"
  on public.profiles;

create policy "Users can insert own profile"
  on public.profiles
  for insert
  to authenticated
  with check (auth.uid() = id);

drop policy if exists "Users can update own profile"
  on public.profiles;

create policy "Users can update own profile"
  on public.profiles
  for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Products
drop policy if exists "Anyone can view active products"
  on public.products;

create policy "Anyone can view active products"
  on public.products
  for select
  to anon, authenticated
  using (is_active = true);

-- Addresses
drop policy if exists "Users can view own addresses"
  on public.addresses;

create policy "Users can view own addresses"
  on public.addresses
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users can create own addresses"
  on public.addresses;

create policy "Users can create own addresses"
  on public.addresses
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own addresses"
  on public.addresses;

create policy "Users can update own addresses"
  on public.addresses
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete own addresses"
  on public.addresses;

create policy "Users can delete own addresses"
  on public.addresses
  for delete
  to authenticated
  using (auth.uid() = user_id);

-- Orders
drop policy if exists "Users can view own orders"
  on public.orders;

create policy "Users can view own orders"
  on public.orders
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users can create own orders"
  on public.orders;

create policy "Users can create own orders"
  on public.orders
  for insert
  to authenticated
  with check (auth.uid() = user_id);

-- Order items
drop policy if exists "Users can view own order items"
  on public.order_items;

create policy "Users can view own order items"
  on public.order_items
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.orders
      where public.orders.id = order_items.order_id
        and public.orders.user_id = auth.uid()
    )
  );

drop policy if exists "Users can create own order items"
  on public.order_items;

create policy "Users can create own order items"
  on public.order_items
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.orders
      where public.orders.id = order_items.order_id
        and public.orders.user_id = auth.uid()
    )
  );

-- Wishlists
drop policy if exists "Users can view own wishlist"
  on public.wishlists;

create policy "Users can view own wishlist"
  on public.wishlists
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users can add to own wishlist"
  on public.wishlists;

create policy "Users can add to own wishlist"
  on public.wishlists
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users can remove from own wishlist"
  on public.wishlists;

create policy "Users can remove from own wishlist"
  on public.wishlists
  for delete
  to authenticated
  using (auth.uid() = user_id);

-- Initial products
insert into public.products (
  sku,
  name,
  description,
  brand,
  category,
  subcategory,
  price,
  compare_at_price,
  image_url,
  sizes,
  colors,
  stock_quantity
)
values
(
  'UC-MEN-001',
  'Urban Classic T-Shirt',
  'Premium cotton casual t-shirt.',
  'UrbanCart',
  'Men',
  'T-Shirts',
  799,
  999,
  'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80',
  ARRAY['S','M','L','XL'],
  ARRAY['Black','White','Blue'],
  100
),
(
  'UC-MEN-002',
  'Slim Fit Denim Jeans',
  'Modern slim fit denim jeans.',
  'UrbanCart',
  'Men',
  'Jeans',
  1499,
  1999,
  'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=900&q=80',
  ARRAY['30','32','34','36'],
  ARRAY['Blue','Black'],
  75
),
(
  'UC-WOMEN-001',
  'Classic Women''s Jacket',
  'Stylish everyday jacket.',
  'UrbanCart',
  'Women',
  'Jackets',
  2299,
  2999,
  'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=900&q=80',
  ARRAY['S','M','L','XL'],
  ARRAY['Black','Brown'],
  50
),
(
  'UC-SHOE-001',
  'Urban Runner Sneakers',
  'Lightweight everyday running sneakers.',
  'UrbanCart',
  'Shoes',
  'Sneakers',
  2499,
  3299,
  'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80',
  ARRAY['7','8','9','10','11'],
  ARRAY['White','Black','Red'],
  60
),
(
  'UC-ACC-001',
  'Urban Leather Backpack',
  'Premium casual backpack for everyday use.',
  'UrbanCart',
  'Accessories',
  'Bags',
  1799,
  2299,
  'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=80',
  ARRAY['One Size'],
  ARRAY['Black','Brown'],
  40
)
on conflict (sku) do nothing;