-- =============================================
-- OrtoCenter — Schema do banco de dados Supabase
-- Execute este SQL no SQL Editor do Supabase
-- =============================================

-- Tabela principal de pedidos
create table orders (
  id text primary key,
  created_at timestamptz default now(),
  status integer default 0,
  customer_name text,
  customer_cpf text,
  customer_birth_date text,
  customer_email text,
  customer_phone text,
  address_cep text,
  address_street text,
  address_number text,
  address_complement text,
  address_neighborhood text,
  address_city text,
  address_state text,
  address_country text default 'Brasil',
  delivery_method text,
  delivery_cost numeric(10,2) default 0,
  payment_method text,
  payment_card jsonb,
  payment_pix_code text,
  payment_boleto_code text,
  subtotal numeric(10,2),
  shipping numeric(10,2),
  total numeric(10,2)
);

-- Tabela de itens do pedido
create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id text references orders(id) on delete cascade,
  product_id text,
  product_name text,
  product_slug text,
  brand text,
  size text,
  qty integer,
  unit_price numeric(10,2),
  original_price numeric(10,2)
);

-- Indices para buscas rapidas
create index idx_orders_created_at on orders(created_at desc);
create index idx_orders_customer_email on orders(customer_email);
create index idx_orders_customer_cpf on orders(customer_cpf);
create index idx_order_items_order_id on order_items(order_id);

-- RLS (Row Level Security) — permite acesso publico para leitura e escrita
alter table orders enable row level security;
alter table order_items enable row level security;

create policy "Permitir inserir pedidos" on orders
  for insert with check (true);

create policy "Permitir ler pedidos" on orders
  for select using (true);

create policy "Permitir atualizar pedidos" on orders
  for update using (true);

create policy "Permitir deletar pedidos" on orders
  for delete using (true);

create policy "Permitir inserir itens" on order_items
  for insert with check (true);

create policy "Permitir ler itens" on order_items
  for select using (true);

create policy "Permitir deletar itens" on order_items
  for delete using (true);
