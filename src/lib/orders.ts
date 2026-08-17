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

export function getOrders(): Order[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function getOrderById(id: string): Order | undefined {
  return getOrders().find((o) => o.id === id);
}

export function saveOrder(
  customer: OrderCustomer,
  address: OrderAddress,
  deliveryMethod: string,
  deliveryCost: number,
  payment: OrderPayment,
  items: OrderItem[],
  subtotal: number,
  shipping: number,
  total: number,
): Order {
  const order: Order = {
    id: generateId(),
    date: new Date().toISOString(),
    status: 0,
    customer,
    address,
    delivery: { method: deliveryMethod, cost: deliveryCost },
    payment: {
      ...payment,
      pixCode: payment.method === "pix" ? generatePixCode() : undefined,
      boletoCode: payment.method === "boleto" ? generateBoletoCode() : undefined,
    },
    items,
    subtotal,
    shipping,
    total,
  };

  const orders = getOrders();
  orders.unshift(order);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
  return order;
}

export function deleteOrder(id: string): void {
  const orders = getOrders().filter((o) => o.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
}

export function clearOrders(): void {
  localStorage.removeItem(STORAGE_KEY);
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
