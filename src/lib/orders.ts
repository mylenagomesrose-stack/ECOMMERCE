import { supabase } from "./supabase";

export interface OrderCustomer {
  name: string;
  cpf: string;
  birthDate: string;
  email: string;
  phone: string;
}

export interface OrderAddress {
  cep: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
  country: string;
}

export interface OrderCardPayment {
  number: string;
  holderName: string;
  expiry: string;
  cvv: string;
  installments: number;
}

export interface OrderPayment {
  method: "pix" | "cartao" | "boleto";
  card?: OrderCardPayment;
  pixCode?: string;
  boletoCode?: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  productSlug: string;
  brand: string;
  size?: string;
  qty: number;
  unitPrice: number;
  originalPrice: number;
}

export interface Order {
  id: string;
  date: string;
  status: number;
  customer: OrderCustomer;
  address: OrderAddress;
  delivery: { method: string; cost: number };
  payment: OrderPayment;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
}

const STORAGE_KEY = "ortocenter:orders";

function generateId(): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `OC-${ts}-${rand}`;
}

function generatePixCode(): string {
  const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let code = "";
  for (let i = 0; i < 32; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

function generateBoletoCode(): string {
  let code = "";
  for (let i = 0; i < 47; i++) code += Math.floor(Math.random() * 10).toString();
  return code.replace(/(\d{5})(\d{5})(\d{5})(\d{6})(\d{5})(\d{6})(\d)(\d{14})/, "$1.$2 $3.$4 $5.$6 $7 $8");
}

// ---------- localStorage (fallback) ----------

function getOrdersLocal(): Order[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveOrderLocal(order: Order): void {
  const orders = getOrdersLocal();
  orders.unshift(order);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
}

function deleteOrderLocal(id: string): void {
  const orders = getOrdersLocal().filter((o) => o.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
}

// ---------- Supabase helpers ----------

function rowToOrder(row: Record<string, unknown>, items: Record<string, unknown>[]): Order {
  return {
    id: row.id as string,
    date: row.created_at as string,
    status: row.status as number,
    customer: {
      name: row.customer_name as string,
      cpf: row.customer_cpf as string,
      birthDate: row.customer_birth_date as string,
      email: row.customer_email as string,
      phone: row.customer_phone as string,
    },
    address: {
      cep: row.address_cep as string,
      street: row.address_street as string,
      number: row.address_number as string,
      complement: row.address_complement as string,
      neighborhood: row.address_neighborhood as string,
      city: row.address_city as string,
      state: row.address_state as string,
      country: row.address_country as string,
    },
    delivery: {
      method: row.delivery_method as string,
      cost: Number(row.delivery_cost),
    },
    payment: {
      method: row.payment_method as "pix" | "cartao" | "boleto",
      card: (row.payment_card as OrderCardPayment) ?? undefined,
      pixCode: (row.payment_pix_code as string) ?? undefined,
      boletoCode: (row.payment_boleto_code as string) ?? undefined,
    },
    items: items.map((i) => ({
      productId: i.product_id as string,
      productName: i.product_name as string,
      productSlug: i.product_slug as string,
      brand: i.brand as string,
      size: (i.size as string) ?? undefined,
      qty: i.qty as number,
      unitPrice: Number(i.unit_price),
      originalPrice: Number(i.original_price),
    })),
    subtotal: Number(row.subtotal),
    shipping: Number(row.shipping),
    total: Number(row.total),
  };
}

// ---------- Public API ----------

export async function getOrders(): Promise<Order[]> {
  if (!supabase) return getOrdersLocal();

  const { data: rows, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (error || !rows) return getOrdersLocal();

  const { data: allItems } = await supabase.from("order_items").select("*");
  const itemsMap = new Map<string, Record<string, unknown>[]>();
  for (const item of allItems ?? []) {
    const arr = itemsMap.get(item.order_id as string) ?? [];
    arr.push(item);
    itemsMap.set(item.order_id as string, arr);
  }

  return rows.map((r) => rowToOrder(r, itemsMap.get(r.id as string) ?? []));
}

export async function getOrderById(id: string): Promise<Order | undefined> {
  if (!supabase) return getOrdersLocal().find((o) => o.id === id);

  const { data: row } = await supabase
    .from("orders")
    .select("*")
    .eq("id", id)
    .single();

  if (!row) return undefined;

  const { data: items } = await supabase
    .from("order_items")
    .select("*")
    .eq("order_id", id);

  return rowToOrder(row, items ?? []);
}

export async function saveOrder(
  customer: OrderCustomer,
  address: OrderAddress,
  deliveryMethod: string,
  deliveryCost: number,
  payment: OrderPayment,
  items: OrderItem[],
  subtotal: number,
  shipping: number,
  total: number,
): Promise<Order> {
  const id = generateId();
  const pixCode = payment.method === "pix" ? generatePixCode() : undefined;
  const boletoCode = payment.method === "boleto" ? generateBoletoCode() : undefined;

  const order: Order = {
    id,
    date: new Date().toISOString(),
    status: 0,
    customer,
    address,
    delivery: { method: deliveryMethod, cost: deliveryCost },
    payment: { ...payment, pixCode, boletoCode },
    items,
    subtotal,
    shipping,
    total,
  };

  if (!supabase) {
    saveOrderLocal(order);
    return order;
  }

  await supabase.from("orders").insert({
    id,
    status: 0,
    customer_name: customer.name,
    customer_cpf: customer.cpf,
    customer_birth_date: customer.birthDate,
    customer_email: customer.email,
    customer_phone: customer.phone,
    address_cep: address.cep,
    address_street: address.street,
    address_number: address.number,
    address_complement: address.complement,
    address_neighborhood: address.neighborhood,
    address_city: address.city,
    address_state: address.state,
    address_country: address.country,
    delivery_method: deliveryMethod,
    delivery_cost: deliveryCost,
    payment_method: payment.method,
    payment_card: payment.method === "cartao" ? payment.card : null,
    payment_pix_code: pixCode,
    payment_boleto_code: boletoCode,
    subtotal,
    shipping,
    total,
  });

  if (items.length > 0) {
    await supabase.from("order_items").insert(
      items.map((item) => ({
        order_id: id,
        product_id: item.productId,
        product_name: item.productName,
        product_slug: item.productSlug,
        brand: item.brand,
        size: item.size ?? null,
        qty: item.qty,
        unit_price: item.unitPrice,
        original_price: item.originalPrice,
      })),
    );
  }

  return order;
}

export async function deleteOrder(id: string): Promise<void> {
  if (!supabase) {
    deleteOrderLocal(id);
    return;
  }
  await supabase.from("orders").delete().eq("id", id);
}

export async function clearOrders(): Promise<void> {
  if (!supabase) {
    if (typeof window !== "undefined") localStorage.removeItem(STORAGE_KEY);
    return;
  }
  await supabase.from("order_items").delete().neq("order_id", "");
  await supabase.from("orders").delete().neq("id", "");
}

export const STATUS_LABELS = [
  "Pedido realizado",
  "Pagamento aprovado",
  "Em preparação",
  "Produto em separação",
  "Pedido pronto",
  "Pedido enviado",
  "Em transporte",
  "Entregue",
] as const;
