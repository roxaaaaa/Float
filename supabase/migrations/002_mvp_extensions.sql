alter table if exists accounts
  add column if not exists latest_balance_pence integer default 0,
  add column if not exists last_synced_at timestamptz,
  add column if not exists risk_level text default 'healthy',
  add column if not exists payroll_shortfall integer,
  add column if not exists days_until_negative integer,
  add column if not exists days_until_below_payroll integer,
  add column if not exists analysis_summary text,
  add column if not exists benchmarks jsonb default '{}'::jsonb,
  add column if not exists benchmark_insight text,
  add column if not exists auth_mode text default 'anonymous';

create index if not exists invoices_account_due_date on invoices(account_id, due_date asc);
create index if not exists incidents_account_opened_at on incidents(account_id, opened_at desc);
create index if not exists calls_account_initiated_at on calls(account_id, initiated_at desc);
create index if not exists chat_messages_account_created on chat_messages(account_id, created_at desc);

-- helpers for updated_at consistency
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_accounts_updated_at on accounts;
create trigger set_accounts_updated_at
before update on accounts
for each row execute function public.set_updated_at();

drop trigger if exists set_invoices_updated_at on invoices;
create trigger set_invoices_updated_at
before update on invoices
for each row execute function public.set_updated_at();
