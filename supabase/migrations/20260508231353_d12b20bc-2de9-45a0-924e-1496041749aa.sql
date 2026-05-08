
-- PROFILES
create table public.profiles (
  id bigint generated always as identity primary key,
  auth_user_id uuid not null unique references auth.users(id) on delete cascade,
  name text not null default '',
  email text not null,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own" on public.profiles
  for select to authenticated using (auth_user_id = auth.uid());
create policy "profiles_insert_own" on public.profiles
  for insert to authenticated with check (auth_user_id = auth.uid());
create policy "profiles_update_own" on public.profiles
  for update to authenticated using (auth_user_id = auth.uid()) with check (auth_user_id = auth.uid());

-- helper: get current user's profile id (bigint)
create or replace function public.current_profile_id()
returns bigint
language sql
stable
security definer
set search_path = public
as $$
  select id from public.profiles where auth_user_id = auth.uid()
$$;

-- TRANSACTIONS
create table public.transactions (
  id bigint generated always as identity primary key,
  user_id bigint not null references public.profiles(id) on delete cascade,
  type text not null check (type in ('entrada','saida','despesa')),
  date date not null default current_date,
  description text not null default '',
  category text,
  amount numeric(14,2) not null check (amount >= 0),
  payment_method text,
  tags text[] not null default '{}',
  recurring boolean not null default false,
  created_at timestamptz not null default now()
);

create index transactions_user_date_idx on public.transactions (user_id, date desc);

alter table public.transactions enable row level security;

create policy "transactions_select_own" on public.transactions
  for select to authenticated using (user_id = public.current_profile_id());
create policy "transactions_insert_own" on public.transactions
  for insert to authenticated with check (user_id = public.current_profile_id());
create policy "transactions_update_own" on public.transactions
  for update to authenticated using (user_id = public.current_profile_id()) with check (user_id = public.current_profile_id());
create policy "transactions_delete_own" on public.transactions
  for delete to authenticated using (user_id = public.current_profile_id());

-- AUTO-CREATE profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (auth_user_id, name, email)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', ''), new.email);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
