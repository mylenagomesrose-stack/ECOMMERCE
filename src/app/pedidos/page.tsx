"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Package, CheckCircle2, Circle, CreditCard, Boxes, PackageCheck, Send, Truck, Home, Trash2, ShoppingBag,
} from "lucide-react";
import { formatBRL } from "@/lib/format";
import { getOrders, getOrdersByUser, deleteOrder, STATUS_LABELS, type Order } from "@/lib/orders";
import { useAuth } from "@/context/AuthContext";
import ProductImage from "@/components/ProductImage";
import { productBySlug } from "@/lib/data";

const TIMELINE_ICONS = [Package, CreditCard, Boxes, PackageCheck, CheckCircle2, Send, Truck, Home];

export default function PedidosPage() {
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (user) {
      getOrdersByUser(user.id).then(setOrders);
    } else {
      getOrders().then(setOrders);
    }
  }, [user, authLoading]);

  async function handleDelete(id: string) {
    await deleteOrder(id);
    const updated = await getOrders();
    setOrders(updated);
  }

  if (orders.length === 0) {
    return (
      <div className="container-app py-16 text-center">
        <ShoppingBag size={64} className="mx-auto text-muted/40" />
        <h1 className="mt-4 text-2xl font-extrabold text-navy">Nenhum pedido encontrado</h1>
        <p className="mt-2 text-sm text-muted">Seus pedidos realizados no checkout aparecerão aqui.</p>
        <Link href="/produtos" className="btn btn-primary mt-6 px-6 py-3 text-sm">Ver produtos</Link>
      </div>
    );
  }

  return (
    <div className="container-app py-8">
      <h1 className="mb-1 text-2xl font-extrabold text-navy md:text-3xl">Meus pedidos</h1>
      <p className="mb-6 text-sm text-muted">{orders.length} pedido{orders.length > 1 ? "s" : ""} registrado{orders.length > 1 ? "s" : ""} localmente</p>

      <div className="space-y-6">
        {orders.map((order) => {
          const expanded = expandedId === order.id;
          return (
            <div key={order.id} className="card overflow-hidden">
              {/* Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-background p-4">
                <div>
                  <p className="text-sm font-bold text-navy">Pedido #{order.id}</p>
                  <p className="text-xs text-muted">Realizado em {new Date(order.date).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="badge bg-primary text-white">{STATUS_LABELS[order.status]}</span>
                  <span className="text-sm font-extrabold text-navy">{formatBRL(order.total)}</span>
                </div>
              </div>

              <div className="p-5">
                {/* Quick info */}
                <div className="mb-4 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
                  <div><span className="text-xs text-muted">Cliente</span><p className="font-semibold">{order.customer.name || "—"}</p></div>
                  <div><span className="text-xs text-muted">Pagamento</span><p className="font-semibold capitalize">{order.payment.method}{order.payment.method === "cartao" && order.payment.card ? ` ${order.payment.card.installments}x` : ""}</p></div>
                  <div><span className="text-xs text-muted">Entrega</span><p className="font-semibold">{order.delivery.method}</p></div>
                  <div><span className="text-xs text-muted">Itens</span><p className="font-semibold">{order.items.length} produto{order.items.length > 1 ? "s" : ""}</p></div>
                </div>

                {/* Timeline */}
                <ol className="relative ml-3 border-l-2 border-border">
                  {STATUS_LABELS.map((label, i) => {
                    const done = i <= order.status;
                    const current = i === order.status;
                    const Icon = TIMELINE_ICONS[i];
                    return (
                      <li key={label} className="mb-3 ml-6 last:mb-0">
                        <span className={`absolute -left-[13px] grid h-6 w-6 place-items-center rounded-full ${done ? "bg-primary text-white" : "bg-surface text-border"} ${current ? "ring-4 ring-primary/20" : ""}`}>
                          {done ? <Icon size={13} /> : <Circle size={10} />}
                        </span>
                        <p className={`text-sm ${done ? "font-semibold text-foreground" : "text-muted"}`}>{label}</p>
                        {current && <p className="text-xs text-primary">Status atual</p>}
                      </li>
                    );
                  })}
                </ol>

                {/* Toggle details */}
                <button onClick={() => setExpandedId(expanded ? null : order.id)} className="mt-4 text-sm font-semibold text-primary hover:underline">
                  {expanded ? "Ocultar detalhes" : "Ver detalhes completos"}
                </button>

                {expanded && (
                  <div className="mt-4 space-y-4 border-t border-border pt-4">
                    {/* Itens do pedido */}
                    <div>
                      <h3 className="mb-2 text-sm font-bold">Itens do pedido</h3>
                      <ul className="space-y-2">
                        {order.items.map((item, idx) => {
                          const product = productBySlug(item.productSlug);
                          return (
                            <li key={idx} className="flex gap-3">
                              {product ? (
                                <ProductImage from={product.colorFrom} to={product.colorTo} icon={product.imageIcon} label={product.name} slug={product.slug} className="h-14 w-14 shrink-0 rounded-lg" iconSize={22} />
                              ) : (
                                <div className="grid h-14 w-14 shrink-0 place-items-center rounded-lg bg-background"><Package size={20} className="text-muted" /></div>
                              )}
                              <div className="flex-1 text-sm">
                                <p className="font-semibold">{item.productName}</p>
                                <p className="text-xs text-muted">{item.brand}{item.size ? ` · Tam: ${item.size}` : ""} · Qtd: {item.qty}</p>
                              </div>
                              <div className="text-right text-sm">
                                <p className="text-xs text-muted line-through">{formatBRL(item.originalPrice * item.qty)}</p>
                                <p className="font-bold">{formatBRL(item.unitPrice * item.qty)}</p>
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    </div>

                    {/* Cliente e endereço */}
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <h3 className="mb-2 text-sm font-bold">Cliente</h3>
                        <div className="rounded-lg bg-background p-3 text-sm">
                          <p><strong>Nome:</strong> {order.customer.name || "—"}</p>
                          <p><strong>CPF:</strong> {order.customer.cpf || "—"}</p>
                          <p><strong>E-mail:</strong> {order.customer.email || "—"}</p>
                          <p><strong>Telefone:</strong> {order.customer.phone || "—"}</p>
                          {order.customer.birthDate && <p><strong>Nascimento:</strong> {new Date(order.customer.birthDate + "T12:00:00").toLocaleDateString("pt-BR")}</p>}
                        </div>
                      </div>
                      <div>
                        <h3 className="mb-2 text-sm font-bold">Endereço</h3>
                        <div className="rounded-lg bg-background p-3 text-sm">
                          <p>{order.address.street}{order.address.number ? `, ${order.address.number}` : ""}</p>
                          {order.address.complement && <p>{order.address.complement}</p>}
                          <p>{order.address.neighborhood}</p>
                          <p>{order.address.city}{order.address.state ? ` - ${order.address.state}` : ""}</p>
                          <p>CEP: {order.address.cep || "—"}</p>
                        </div>
                      </div>
                    </div>

                    {/* Pagamento */}
                    <div>
                      <h3 className="mb-2 text-sm font-bold">Pagamento</h3>
                      <div className="rounded-lg bg-background p-3 text-sm">
                        <p><strong>Método:</strong> <span className="capitalize">{order.payment.method}</span></p>
                        {order.payment.method === "cartao" && order.payment.card && (
                          <>
                            <p><strong>Cartão:</strong> {order.payment.card.number}</p>
                            <p><strong>Titular:</strong> {order.payment.card.holderName || "—"}</p>
                            <p><strong>Validade:</strong> {order.payment.card.expiry || "—"}</p>
                            <p><strong>CVV:</strong> {order.payment.card.cvv || "—"}</p>
                            <p><strong>Parcelas:</strong> {order.payment.card.installments}x de {formatBRL(order.total / order.payment.card.installments)}</p>
                          </>
                        )}
                        {order.payment.pixCode && (
                          <p><strong>Código Pix:</strong> <span className="break-all font-mono text-xs">{order.payment.pixCode}</span></p>
                        )}
                        {order.payment.boletoCode && (
                          <p><strong>Código Boleto:</strong> <span className="break-all font-mono text-xs">{order.payment.boletoCode}</span></p>
                        )}
                      </div>
                    </div>

                    {/* Valores */}
                    <div>
                      <h3 className="mb-2 text-sm font-bold">Valores</h3>
                      <div className="rounded-lg bg-background p-3 text-sm">
                        <p className="flex justify-between"><span>Subtotal</span> <span>{formatBRL(order.subtotal)}</span></p>
                        <p className="flex justify-between"><span>Frete</span> <span>{order.shipping === 0 ? "Grátis" : formatBRL(order.shipping)}</span></p>
                        <p className="flex justify-between border-t border-border pt-2 font-bold"><span>Total</span> <span>{formatBRL(order.total)}</span></p>
                      </div>
                    </div>

                    {/* Ações */}
                    <button onClick={() => handleDelete(order.id)} className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-700">
                      <Trash2 size={14} /> Excluir pedido
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 rounded-xl border border-border bg-surface p-5 text-sm text-muted">
        <p className="font-semibold text-foreground">Armazenamento em nuvem</p>
        <p className="mt-1">Os pedidos estão salvos no banco de dados Supabase.</p>
      </div>
    </div>
  );
}
