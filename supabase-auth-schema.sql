-- =============================================
-- OrtoCenter — Schema de perfis de usuário
-- Execute este SQL no SQL Editor do Supabase
-- (após já ter executado o supabase-schema.sql)
-- =============================================

-- Tabela de perfis vinculada ao Supabase Auth
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  cpf text,
  birth_date text,
  phone text,
  created_at timestamptz default now()
);

-- Índice para busca por CPF
create index idx_profiles_cpf on profiles(cpf);

-- RLS
alter table profiles enable row level security;

create policy "Usuário pode ver próprio perfil" on profiles
  for select using (auth.uid() = id);

create policy "Usuário pode atualizar próprio perfil" on profiles
  for update using (auth.uid() = id);

create policy "Usuário pode inserir próprio perfil" on profiles
  for insert with check (auth.uid() = id);

-- Adicionar coluna user_id na tabela orders (vincula pedido ao usuário)
alter table orders add column if not exists user_id uuid references auth.users(id);
create index if not exists idx_orders_user_id on orders(user_id);
