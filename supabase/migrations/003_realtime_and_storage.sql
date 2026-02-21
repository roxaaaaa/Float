-- Enable realtime replication for required tables
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'invoices'
  ) then
    alter publication supabase_realtime add table public.invoices;
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'incidents'
  ) then
    alter publication supabase_realtime add table public.incidents;
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'calls'
  ) then
    alter publication supabase_realtime add table public.calls;
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'ai_insights'
  ) then
    alter publication supabase_realtime add table public.ai_insights;
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'cashflow_projections'
  ) then
    alter publication supabase_realtime add table public.cashflow_projections;
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'chat_messages'
  ) then
    alter publication supabase_realtime add table public.chat_messages;
  end if;
end $$;

-- Create private storage bucket for invoices
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'invoice-uploads',
  'invoice-uploads',
  false,
  10485760,
  array[
    'application/pdf',
    'image/png',
    'image/jpeg',
    'image/heic'
  ]
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Storage policies (authenticated users in hackathon mode)
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'Invoice uploads read own bucket'
  ) then
    create policy "Invoice uploads read own bucket"
      on storage.objects
      for select
      using (bucket_id = 'invoice-uploads' and auth.role() = 'authenticated');
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'Invoice uploads insert own bucket'
  ) then
    create policy "Invoice uploads insert own bucket"
      on storage.objects
      for insert
      with check (bucket_id = 'invoice-uploads' and auth.role() = 'authenticated');
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'Invoice uploads delete own bucket'
  ) then
    create policy "Invoice uploads delete own bucket"
      on storage.objects
      for delete
      using (bucket_id = 'invoice-uploads' and auth.role() = 'authenticated');
  end if;
end $$;
