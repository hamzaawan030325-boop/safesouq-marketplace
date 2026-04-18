create table users (
  id uuid primary key,
  name varchar(120) not null,
  email varchar(160) unique not null,
  phone varchar(32),
  password_hash text not null,
  role varchar(32) not null,
  two_factor_enabled boolean default false,
  status varchar(32) default 'active',
  created_at timestamptz default now()
);

create table seller_profiles (
  id uuid primary key,
  user_id uuid references users(id),
  shop_name varchar(160) not null,
  kyc_status varchar(32) not null,
  risk_score integer default 0,
  payout_account_id varchar(120),
  created_at timestamptz default now()
);

create table products (
  id uuid primary key,
  seller_id uuid references users(id),
  title varchar(180) not null,
  slug varchar(200) unique not null,
  description text,
  category varchar(80),
  status varchar(40) default 'pending_review',
  created_at timestamptz default now()
);

create table product_variants (
  id uuid primary key,
  product_id uuid references products(id),
  sku varchar(80) unique not null,
  price numeric(12,2) not null,
  stock integer default 0,
  attributes_json jsonb default '{}'::jsonb
);

create table orders (
  id uuid primary key,
  buyer_id uuid references users(id),
  seller_id uuid references users(id),
  status varchar(40) not null,
  total_amount numeric(12,2) not null,
  payment_status varchar(40),
  shipping_status varchar(40),
  created_at timestamptz default now()
);

create table payments (
  id uuid primary key,
  order_id uuid references orders(id),
  provider varchar(80),
  txn_ref varchar(120),
  escrow_status varchar(40),
  released_at timestamptz
);

create table disputes (
  id uuid primary key,
  order_id uuid references orders(id),
  raised_by uuid references users(id),
  reason varchar(200),
  evidence_url text,
  resolution text,
  status varchar(40),
  created_at timestamptz default now()
);

create table piracy_reports (
  id uuid primary key,
  reporter_id uuid references users(id),
  product_id uuid references products(id),
  report_type varchar(80),
  status varchar(40),
  notes text,
  created_at timestamptz default now()
);
