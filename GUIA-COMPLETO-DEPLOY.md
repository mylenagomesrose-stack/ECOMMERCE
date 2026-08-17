# OrtoCenter — Guia Completo de Deploy e Banco de Dados

## Sobre o Projeto

- **Nome:** OrtoCenter — Artigos Ortopedicos
- **Stack:** Next.js 16 (App Router) + React 19 + Tailwind CSS v4
- **Produtos:** 271 produtos (60 Endurance + 211 CenterMedi) em 15 categorias
- **Painel Admin:** /admin (gestao de pedidos local)
- **Persistencia atual:** localStorage (navegador)

---

## 1. COMO RODAR LOCALMENTE

### Pre-requisitos
- Node.js 18+ instalado (https://nodejs.org)
- npm (vem junto com o Node.js)

### Passo a passo

```bash
# 1. Abra o terminal na pasta do projeto
cd C:\Users\TREINAMENTO\Documents\ecommerce-ortopedico

# 2. Instale as dependencias
npm install

# 3. Inicie o servidor de desenvolvimento
npm run dev

# 4. Acesse no navegador
# Loja: http://localhost:3000
# Painel Admin: http://localhost:3000/admin
```

### Estrutura de pastas principais

```
ecommerce-ortopedico/
├── public/
│   └── products/          # 271 fotos dos produtos (.jpg, .png, .jpeg, .webp)
├── src/
│   ├── app/
│   │   ├── admin/         # Painel administrativo
│   │   ├── checkout/      # Pagina de checkout (5 etapas)
│   │   ├── pedidos/       # Meus pedidos (leitor de localStorage)
│   │   ├── produto/       # Pagina individual do produto
│   │   ├── produtos/      # Catalogo com filtros
│   │   ├── ofertas/       # Produtos com 60% OFF
│   │   ├── categoria/     # Paginas por categoria
│   │   └── layout.tsx     # Layout principal
│   ├── components/        # Componentes reutilizaveis
│   ├── context/           # CartContext (carrinho com localStorage)
│   └── lib/
│       ├── data.ts        # 271 produtos em 15 categorias, precos, badges
│       ├── orders.ts      # CRUD de pedidos no localStorage
│       ├── pricing.ts     # Logica de descontos (40% padrao, 60% oferta)
│       ├── format.ts      # Formatacao BRL
│       └── types.ts       # Interfaces TypeScript
├── package.json
├── next.config.ts
├── tailwind.config.ts
└── tsconfig.json
```

---

## 2. MIGRAR PARA BANCO DE DADOS (Supabase)

O projeto salva pedidos no localStorage. Para migrar para um banco real, use o Supabase (PostgreSQL gratuito na nuvem).

### 2.1 Criar conta no Supabase

1. Acesse https://supabase.com
2. Clique em "Start your project"
3. Faca login com GitHub ou e-mail
4. Clique em "New Project"
5. Preencha:
   - **Name:** ortocenter
   - **Database Password:** crie uma senha forte (anote!)
   - **Region:** South America (Sao Paulo)
6. Clique em "Create new project"
7. Aguarde ~2 minutos para o projeto ser criado

### 2.2 Criar as tabelas no banco

Va em **SQL Editor** no painel do Supabase e execute:

```sql
-- ============================================
-- TABELA DE CLIENTES
-- ============================================
CREATE TABLE customers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  cpf TEXT,
  birth_date DATE,
  email TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- TABELA DE ENDERECOS
-- ============================================
CREATE TABLE addresses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  cep TEXT,
  street TEXT,
  number TEXT,
  complement TEXT,
  neighborhood TEXT,
  city TEXT,
  state TEXT,
  country TEXT DEFAULT 'Brasil',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- TABELA DE PEDIDOS
-- ============================================
CREATE TABLE orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_code TEXT UNIQUE NOT NULL,        -- ex: OC-XXXXX-XXXX
  customer_id UUID REFERENCES customers(id),
  address_id UUID REFERENCES addresses(id),
  status INTEGER DEFAULT 0,              -- 0=realizado, 1=aprovado, ... 7=entregue
  delivery_method TEXT,                  -- 'Entrega padrao' ou 'Retirar no local'
  delivery_cost NUMERIC(10,2) DEFAULT 0,
  payment_method TEXT NOT NULL,          -- 'pix', 'cartao', 'boleto'
  subtotal NUMERIC(10,2) NOT NULL,
  shipping NUMERIC(10,2) DEFAULT 0,
  total NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- TABELA DE PAGAMENTOS (dados sensiveis)
-- ============================================
CREATE TABLE payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  method TEXT NOT NULL,                  -- 'pix', 'cartao', 'boleto'
  -- Cartao
  card_number TEXT,
  card_holder_name TEXT,
  card_expiry TEXT,
  card_cvv TEXT,
  card_installments INTEGER,
  -- Pix
  pix_code TEXT,
  -- Boleto
  boleto_code TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- TABELA DE ITENS DO PEDIDO
-- ============================================
CREATE TABLE order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL,
  product_name TEXT NOT NULL,
  product_slug TEXT NOT NULL,
  brand TEXT,
  size TEXT,
  qty INTEGER NOT NULL DEFAULT 1,
  unit_price NUMERIC(10,2) NOT NULL,
  original_price NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- INDICES PARA PERFORMANCE
-- ============================================
CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_code ON orders(order_code);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_payments_order ON payments(order_id);
CREATE INDEX idx_addresses_customer ON addresses(customer_id);
```

### 2.3 Pegar as credenciais do Supabase

1. No painel do Supabase, va em **Settings > API**
2. Copie:
   - **Project URL** (ex: `https://xyzabcdef.supabase.co`)
   - **anon public key** (ex: `eyJhbGciOiJIUzI1NiIs...`)
3. Crie o arquivo `.env.local` na raiz do projeto:

```env
# .env.local (NAO suba esse arquivo no GitHub!)
NEXT_PUBLIC_SUPABASE_URL=https://SEU-PROJETO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon-aqui
```

### 2.4 Instalar o Supabase no projeto

```bash
npm install @supabase/supabase-js
```

### 2.5 Criar o cliente Supabase

Crie o arquivo `src/lib/supabase.ts`:

```typescript
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);
```

### 2.6 Exemplo: Salvar pedido no banco (substituir localStorage)

Modifique o arquivo `src/lib/orders.ts`. Exemplo de como ficaria a funcao `saveOrder`:

```typescript
import { supabase } from "./supabase";

export async function saveOrderToDB(
  customer: OrderCustomer,
  address: OrderAddress,
  deliveryMethod: string,
  deliveryCost: number,
  payment: OrderPayment,
  items: OrderItem[],
  subtotal: number,
  shipping: number,
  total: number
) {
  // 1. Salvar cliente
  const { data: customerData, error: customerError } = await supabase
    .from("customers")
    .insert({
      name: customer.name,
      cpf: customer.cpf,
      birth_date: customer.birthDate || null,
      email: customer.email,
      phone: customer.phone,
    })
    .select()
    .single();

  if (customerError) throw customerError;

  // 2. Salvar endereco
  const { data: addressData, error: addressError } = await supabase
    .from("addresses")
    .insert({
      customer_id: customerData.id,
      cep: address.cep,
      street: address.street,
      number: address.number,
      complement: address.complement,
      neighborhood: address.neighborhood,
      city: address.city,
      state: address.state,
      country: address.country,
    })
    .select()
    .single();

  if (addressError) throw addressError;

  // 3. Gerar codigo do pedido
  const orderCode = `OC-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

  // 4. Salvar pedido
  const { data: orderData, error: orderError } = await supabase
    .from("orders")
    .insert({
      order_code: orderCode,
      customer_id: customerData.id,
      address_id: addressData.id,
      status: 0,
      delivery_method: deliveryMethod,
      delivery_cost: deliveryCost,
      payment_method: payment.method,
      subtotal,
      shipping,
      total,
    })
    .select()
    .single();

  if (orderError) throw orderError;

  // 5. Salvar dados de pagamento
  const pixCode = payment.method === "pix" ? generatePixCode() : null;
  const boletoCode = payment.method === "boleto" ? generateBoletoCode() : null;

  await supabase.from("payments").insert({
    order_id: orderData.id,
    method: payment.method,
    card_number: payment.card?.number || null,
    card_holder_name: payment.card?.holderName || null,
    card_expiry: payment.card?.expiry || null,
    card_cvv: payment.card?.cvv || null,
    card_installments: payment.card?.installments || null,
    pix_code: pixCode,
    boleto_code: boletoCode,
  });

  // 6. Salvar itens do pedido
  const itemsToInsert = items.map((item) => ({
    order_id: orderData.id,
    product_id: item.productId,
    product_name: item.productName,
    product_slug: item.productSlug,
    brand: item.brand,
    size: item.size || null,
    qty: item.qty,
    unit_price: item.unitPrice,
    original_price: item.originalPrice,
  }));

  await supabase.from("order_items").insert(itemsToInsert);

  return { ...orderData, order_code: orderCode };
}
```

### 2.7 Exemplo: Buscar pedidos do banco (painel admin)

```typescript
import { supabase } from "./supabase";

export async function getOrdersFromDB() {
  const { data, error } = await supabase
    .from("orders")
    .select(`
      *,
      customers (*),
      addresses (*),
      payments (*),
      order_items (*)
    `)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

// Buscar pedido por codigo
export async function getOrderByCode(code: string) {
  const { data, error } = await supabase
    .from("orders")
    .select(`
      *,
      customers (*),
      addresses (*),
      payments (*),
      order_items (*)
    `)
    .eq("order_code", code)
    .single();

  if (error) throw error;
  return data;
}

// Deletar pedido
export async function deleteOrderFromDB(id: string) {
  const { error } = await supabase
    .from("orders")
    .delete()
    .eq("id", id);

  if (error) throw error;
}
```

---

## 3. HOSPEDAGEM (Colocar o site no ar)

### Opcao A: Vercel (Recomendado para Next.js — GRATUITO)

A Vercel e a empresa que criou o Next.js. E a melhor opcao.

#### Passo a passo:

1. **Criar conta no GitHub** (se nao tiver): https://github.com
2. **Subir o codigo no GitHub:**

```bash
# Na pasta do projeto
cd C:\Users\TREINAMENTO\Documents\ecommerce-ortopedico

# Inicializar repositorio git
git init

# Adicionar todos os arquivos
git add .

# Criar primeiro commit
git commit -m "OrtoCenter - e-commerce de artigos ortopedicos"

# Criar repositorio no GitHub (instale o GitHub CLI: https://cli.github.com)
gh repo create ortocenter --public --source=. --push

# OU manualmente:
# 1. Va em github.com/new
# 2. Crie o repo "ortocenter"
# 3. Siga as instrucoes para push
```

3. **Deploy na Vercel:**
   - Acesse https://vercel.com
   - Clique em "Start Deploying"
   - Faca login com GitHub
   - Clique em "Import Project"
   - Selecione o repositorio "ortocenter"
   - Em **Environment Variables**, adicione:
     - `NEXT_PUBLIC_SUPABASE_URL` = sua URL do Supabase
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = sua chave anon
   - Clique em "Deploy"
   - Aguarde ~2 minutos
   - Seu site estara no ar em: `https://ortocenter.vercel.app`

4. **Dominio personalizado (opcional):**
   - Compre um dominio (ex: ortocenter.com.br) no Registro.br ou GoDaddy
   - Na Vercel, va em Settings > Domains
   - Adicione seu dominio
   - Configure o DNS conforme instrucoes da Vercel

#### Plano gratuito da Vercel inclui:
- HTTPS automatico
- Deploy automatico a cada push no GitHub
- CDN global (site rapido no mundo todo)
- 100GB de banda/mes
- Sem limite de deploys

---

### Opcao B: Netlify (Alternativa gratuita)

1. Acesse https://netlify.com
2. Faca login com GitHub
3. Clique em "Add new site" > "Import an existing project"
4. Selecione o repositorio
5. Configure:
   - **Build command:** `npm run build`
   - **Publish directory:** `.next`
6. Adicione as variaveis de ambiente (Supabase)
7. Clique em "Deploy site"

**Nota:** Para Next.js na Netlify, instale o plugin:
```bash
npm install @netlify/plugin-nextjs
```

---

### Opcao C: VPS (Servidor proprio — para quem quer controle total)

Para hospedar em um servidor Linux (DigitalOcean, AWS, Hostinger):

```bash
# No servidor Linux

# 1. Instalar Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# 2. Clonar o repositorio
git clone https://github.com/SEU-USUARIO/ortocenter.git
cd ortocenter

# 3. Instalar dependencias
npm install

# 4. Criar arquivo .env.local com as credenciais do Supabase
nano .env.local
# Cole as variaveis NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY

# 5. Fazer build de producao
npm run build

# 6. Iniciar o servidor
npm start
# O site roda na porta 3000

# 7. Para manter rodando 24h, use PM2:
npm install -g pm2
pm2 start npm --name "ortocenter" -- start
pm2 startup    # configura para iniciar no boot
pm2 save       # salva a configuracao
```

Para HTTPS, configure o Nginx como proxy reverso:

```nginx
# /etc/nginx/sites-available/ortocenter
server {
    server_name ortocenter.com.br www.ortocenter.com.br;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Ativar o site e HTTPS gratuito com Let's Encrypt
sudo ln -s /etc/nginx/sites-available/ortocenter /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d ortocenter.com.br -d www.ortocenter.com.br
```

---

## 4. CHECKLIST ANTES DE IR PARA PRODUCAO

- [ ] Criar conta no Supabase e configurar as tabelas (secao 2.2)
- [ ] Adicionar .env.local com credenciais do Supabase (secao 2.3)
- [ ] Instalar @supabase/supabase-js (secao 2.4)
- [ ] Substituir localStorage por chamadas ao Supabase (secao 2.6)
- [ ] Testar checkout completo salvando no banco
- [ ] Testar painel admin lendo do banco
- [ ] Subir codigo no GitHub
- [ ] Fazer deploy na Vercel (secao 3A)
- [ ] Configurar dominio personalizado (opcional)
- [ ] Configurar Row Level Security (RLS) no Supabase para seguranca
- [ ] Implementar autenticacao de admin (proteger /admin)

---

## 5. SEGURANCA — IMPORTANTE

### Dados de cartao
O projeto atual salva dados de cartao no localStorage/banco para demonstracao.
Em producao REAL, voce DEVE usar um gateway de pagamento certificado PCI-DSS:
- **Stripe** (https://stripe.com)
- **PagSeguro** (https://pagseguro.uol.com.br)
- **Mercado Pago** (https://mercadopago.com.br)
- **Pagar.me** (https://pagar.me)

Esses gateways processam o cartao de forma segura — voce NUNCA armazena
o numero completo do cartao no seu banco de dados.

### RLS (Row Level Security) no Supabase
Ative RLS nas tabelas para que apenas usuarios autorizados acessem os dados:

```sql
-- Ativar RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;

-- Politica: apenas admin pode ler/escrever (ajuste conforme sua autenticacao)
CREATE POLICY "Admin full access" ON orders FOR ALL USING (true);
CREATE POLICY "Admin full access" ON customers FOR ALL USING (true);
CREATE POLICY "Admin full access" ON payments FOR ALL USING (true);
CREATE POLICY "Admin full access" ON order_items FOR ALL USING (true);
CREATE POLICY "Admin full access" ON addresses FOR ALL USING (true);
```

---

## 6. RESUMO DOS LINKS UTEIS

| Servico | URL | Para que serve |
|---------|-----|----------------|
| Supabase | https://supabase.com | Banco de dados PostgreSQL gratuito |
| Vercel | https://vercel.com | Hospedagem gratuita para Next.js |
| GitHub | https://github.com | Repositorio de codigo |
| Netlify | https://netlify.com | Hospedagem alternativa |
| Stripe | https://stripe.com | Gateway de pagamento |
| Registro.br | https://registro.br | Dominio .com.br |
| Let's Encrypt | https://letsencrypt.org | HTTPS gratuito |
| Node.js | https://nodejs.org | Runtime JavaScript |

---

## 7. CONTATO E SUPORTE

- **E-mail do projeto:** dydiniiz@gmail.com
- **Loja:** OrtoCenter — Artigos Ortopedicos
- **Catalogo de referencia:** catalogo.artigosortopedicos.com/endurance/

---

*Guia criado em Agosto/2026 para o projeto OrtoCenter.*
