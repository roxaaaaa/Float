-- =============================================
-- ACCOUNTS
-- =============================================
create table if not exists accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  business_name text not null default 'My Business',
  sector text default 'restaurant',
  employee_count integer default 0,
  payroll_amount integer default 0,
  payroll_frequency text default 'biweekly',
  payroll_day text default 'friday',
  monzo_access_token text,
  monzo_refresh_token text,
  monzo_account_id text,
  monzo_connected boolean default false,
  onboarding_complete boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table accounts enable row level security;
drop policy if exists "Own account only" on accounts;
create policy "Own account only" on accounts
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- =============================================
-- TRANSACTIONS
-- =============================================
create table if not exists transactions (
  id text primary key,
  account_id uuid references accounts(id) on delete cascade,
  amount integer not null,
  merchant_name text,
  category text,
  description text,
  notes text,
  is_income boolean default false,
  created timestamptz not null,
  synced_at timestamptz default now()
);
alter table transactions enable row level security;
drop policy if exists "Own transactions only" on transactions;
create policy "Own transactions only" on transactions
  for all using (
    account_id in (select id from accounts where user_id = auth.uid())
  )
  with check (
    account_id in (select id from accounts where user_id = auth.uid())
  );
create index if not exists transactions_account_created on transactions(account_id, created desc);

-- =============================================
-- INVOICES
-- =============================================
create table if not exists invoices (
  id uuid primary key default gen_random_uuid(),
  account_id uuid references accounts(id) on delete cascade,
  client_name text not null,
  client_phone text,
  client_email text,
  invoice_number text,
  amount integer not null,
  invoice_date date,
  due_date date,
  status text default 'unpaid',
  stripe_payment_link text,
  stripe_payment_intent_id text,
  call_initiated_at timestamptz,
  call_completed_at timestamptz,
  call_sid text,
  call_outcome text,
  call_notes text,
  paid_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table invoices enable row level security;
drop policy if exists "Own invoices only" on invoices;
create policy "Own invoices only" on invoices
  for all using (
    account_id in (select id from accounts where user_id = auth.uid())
  )
  with check (
    account_id in (select id from accounts where user_id = auth.uid())
  );

-- =============================================
-- AI INSIGHTS
-- =============================================
create table if not exists ai_insights (
  id uuid primary key default gen_random_uuid(),
  account_id uuid references accounts(id) on delete cascade,
  type text not null,
  title text not null,
  message text not null,
  action_label text,
  action_type text,
  action_data jsonb,
  dismissed boolean default false,
  created_at timestamptz default now()
);
alter table ai_insights enable row level security;
drop policy if exists "Own insights only" on ai_insights;
create policy "Own insights only" on ai_insights
  for all using (
    account_id in (select id from accounts where user_id = auth.uid())
  )
  with check (
    account_id in (select id from accounts where user_id = auth.uid())
  );

-- =============================================
-- INCIDENTS
-- =============================================
create table if not exists incidents (
  id uuid primary key default gen_random_uuid(),
  account_id uuid references accounts(id) on delete cascade,
  severity text not null default 'P2',
  title text not null,
  description text,
  status text not null default 'open',
  shortfall_amount integer,
  resolution_amount integer,
  events jsonb default '[]'::jsonb,
  opened_at timestamptz default now(),
  closed_at timestamptz,
  resolved_by text
);
alter table incidents enable row level security;
drop policy if exists "Own incidents only" on incidents;
create policy "Own incidents only" on incidents
  for all using (
    account_id in (select id from accounts where user_id = auth.uid())
  )
  with check (
    account_id in (select id from accounts where user_id = auth.uid())
  );

-- =============================================
-- CASHFLOW PROJECTIONS
-- =============================================
create table if not exists cashflow_projections (
  id uuid primary key default gen_random_uuid(),
  account_id uuid references accounts(id) on delete cascade,
  projection_date date not null,
  projected_balance integer not null,
  is_below_payroll_threshold boolean default false,
  is_below_zero boolean default false,
  confidence_score numeric(3,2) default 0.85,
  created_at timestamptz default now(),
  unique(account_id, projection_date)
);
alter table cashflow_projections enable row level security;
drop policy if exists "Own projections only" on cashflow_projections;
create policy "Own projections only" on cashflow_projections
  for all using (
    account_id in (select id from accounts where user_id = auth.uid())
  )
  with check (
    account_id in (select id from accounts where user_id = auth.uid())
  );

-- =============================================
-- CHAT MESSAGES
-- =============================================
create table if not exists chat_messages (
  id uuid primary key default gen_random_uuid(),
  account_id uuid references accounts(id) on delete cascade,
  role text not null,
  content text not null,
  created_at timestamptz default now()
);
alter table chat_messages enable row level security;
drop policy if exists "Own messages only" on chat_messages;
create policy "Own messages only" on chat_messages
  for all using (
    account_id in (select id from accounts where user_id = auth.uid())
  )
  with check (
    account_id in (select id from accounts where user_id = auth.uid())
  );

-- =============================================
-- CALLS LOG
-- =============================================
create table if not exists calls (
  id uuid primary key default gen_random_uuid(),
  account_id uuid references accounts(id) on delete cascade,
  invoice_id uuid references invoices(id),
  client_name text not null,
  client_phone text not null,
  call_sid text,
  elevenlabs_conversation_id text,
  status text default 'initiated',
  duration_seconds integer,
  outcome text,
  transcript text,
  stripe_link_sent text,
  payment_committed boolean default false,
  payment_committed_date date,
  initiated_at timestamptz default now(),
  completed_at timestamptz
);
alter table calls enable row level security;
drop policy if exists "Own calls only" on calls;
create policy "Own calls only" on calls
  for all using (
    account_id in (select id from accounts where user_id = auth.uid())
  )
  with check (
    account_id in (select id from accounts where user_id = auth.uid())
  );
