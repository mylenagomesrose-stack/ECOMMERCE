"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Package, ShoppingBag, CreditCard, QrCode, Barcode, Users, TrendingUp,
  Trash2, ChevronDown, ChevronUp, Search, Filter, Eye, DollarSign,
  Calendar, MapPin, Phone, Mail, ArrowLeft,
} from "lucide-react";
import { formatBRL } from "@/lib/format";
import { getOrders, deleteOrder, STATUS_LABELS, type Order } from "@/lib/orders";
import ProductImage from "@/components/ProductImage";
import { productBySlug } from "@/lib/data";

type PaymentFilter = "todos" | "pix" | "cartao" | "boleto";
type SortField = "date" | "total" | "name";
type SortDir = "asc" | "desc";

function StatCard({ icon: Icon, label, value, sub, color }: { icon: typeof Package; label: string; value: string; sub?: string; color: string }) {
  return (
    <div className="card flex items-center gap-4 p-5">
      <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl ${color}`}>
        <Icon size={22} />
      </span>
      <div>
        <p className="text-xs font-medium text-muted">{label}</p>
        <p className="text-xl font-extrabold text-navy">{value}</p>
        {sub && <p className="text-xs text-muted">{sub}</p>}
      </div>
    </div>
  );
}

function PaymentBadge({ method }: { method: string }) {
  const map: Record<string, { icon: typeof QrCode; bg: string; label: string }> = {
    pix: { icon: QrCode, bg: "bg-emerald-100 text-emerald-700", label: "Pix" },
    cartao: { icon: CreditCard, bg: "bg-blue-100 text-blue-700", label: "Cartão" },
    boleto: { icon: Barcode, bg: "bg-amber-100 text-amber-700", label: "Boleto" },
  };
  const m = map[method] ?? map.pix;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${m.bg}`}>
      <m.icon size={13} /> {m.label}
    </span>
  );
}

export default function AdminPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [paymentFilter, setPaymentFilter] = useState<PaymentFilter>("todos");
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  useEffect(() => {
    getOrders().then(setOrders);
  }, []);

  async function handleDelete(id: string) {
    await deleteOrder(id);
    const updated = await getOrders();
    setOrders(updated);
    setConfirmDelete(null);
    setExpandedId(null);
  }

  function toggleSort(field: SortField) {
    if (sortField === field) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDir("desc"); }
  }

  const filtered = useMemo(() => {
    let list = [...orders];
    if (paymentFilter !== "todos") list = list.filter(o => o.payment.method === paymentFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(o =>
        o.id.toLowerCase().includes(q) ||
        o.customer.name.toLowerCase().includes(q) ||
        o.customer.cpf.includes(q) ||
        o.customer.email.toLowerCase().includes(q) ||
        o.customer.phone.includes(q)
      );
    }
    list.sort((a, b) => {
      let cmp = 0;
      if (sortField === "date") cmp = new Date(a.date).getTime() - new Date(b.date).getTime();
      else if (sortField === "total") cmp = a.total - b.total;
      else cmp = a.customer.name.localeCompare(b.customer.name);
      return sortDir === "asc" ? cmp : -cmp;
    });
    return list;
  }, [orders, paymentFilter, search, sortField, sortDir]);

  const stats = useMemo(() => {
    const total = orders.reduce((s, o) => s + o.total, 0);
    const pix = orders.filter(o => o.payment.method === "pix").length;
    const cartao = orders.filter(o => o.payment.method === "cartao").length;
    const boleto = orders.filter(o => o.payment.method === "boleto").length;
    const clients = new Set(orders.map(o => o.customer.cpf || o.customer.email)).size;
    return { total, count: orders.length, pix, cartao, boleto, clients };
  }, [orders]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-border bg-navy text-white">
        <div className="container-app flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="grid h-9 w-9 place-items-center rounded-lg bg-white/10 hover:bg-white/20">
              <ArrowLeft size={18} />
            </Link>
            <div>
              <h1 className="text-lg font-extrabold">Painel Administrativo</h1>
              <p className="text-xs text-white/60">OrtoCenter — Gestão de pedidos</p>
            </div>
          </div>
          <span className="rounded-full bg-primary px-3 py-1 text-xs font-bold">{stats.count} pedido{stats.count !== 1 ? "s" : ""}</span>
        </div>
      </header>

      <div className="container-app py-6">
        {/* Stats */}
        <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={DollarSign} label="Faturamento total" value={formatBRL(stats.total)} sub={`${stats.count} pedido${stats.count !== 1 ? "s" : ""}`} color="bg-emerald-100 text-emerald-600" />
          <StatCard icon={Users} label="Clientes únicos" value={String(stats.clients)} color="bg-blue-100 text-blue-600" />
          <StatCard icon={QrCode} label="Pix" value={String(stats.pix)} sub={stats.count ? `${Math.round(stats.pix / stats.count * 100)}%` : "0%"} color="bg-teal-100 text-teal-600" />
          <StatCard icon={CreditCard} label="Cartão / Boleto" value={`${stats.cartao} / ${stats.boleto}`} color="bg-violet-100 text-violet-600" />
        </div>

        {/* Filters */}
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="text"
              placeholder="Buscar por nome, CPF, e-mail, telefone ou nº do pedido..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full rounded-lg border border-border bg-surface py-2.5 pl-9 pr-3 text-sm focus:border-primary focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-1.5">
            <Filter size={14} className="text-muted" />
            {(["todos", "pix", "cartao", "boleto"] as PaymentFilter[]).map(f => (
              <button
                key={f}
                onClick={() => setPaymentFilter(f)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${paymentFilter === f ? "bg-primary text-white" : "bg-surface text-muted hover:bg-border"}`}
              >
                {f === "todos" ? "Todos" : f === "cartao" ? "Cartão" : f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Sort bar */}
        <div className="mb-3 flex items-center gap-4 text-xs text-muted">
          <span>Ordenar:</span>
          {([["date", "Data"], ["total", "Valor"], ["name", "Cliente"]] as [SortField, string][]).map(([f, label]) => (
            <button key={f} onClick={() => toggleSort(f)} className={`flex items-center gap-1 font-semibold ${sortField === f ? "text-primary" : "hover:text-foreground"}`}>
              {label} {sortField === f && (sortDir === "desc" ? <ChevronDown size={13} /> : <ChevronUp size={13} />)}
            </button>
          ))}
          <span className="ml-auto">{filtered.length} resultado{filtered.length !== 1 ? "s" : ""}</span>
        </div>

        {/* Orders */}
        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <ShoppingBag size={48} className="mx-auto text-muted/30" />
            <p className="mt-3 text-sm text-muted">{orders.length === 0 ? "Nenhum pedido registrado ainda." : "Nenhum pedido corresponde aos filtros."}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(order => {
              const expanded = expandedId === order.id;
              return (
                <div key={order.id} className="card overflow-hidden">
                  {/* Row */}
                  <button
                    onClick={() => setExpandedId(expanded ? null : order.id)}
                    className="flex w-full flex-wrap items-center gap-3 p-4 text-left hover:bg-surface/50"
                  >
                    <div className="flex-1 min-w-[180px]">
                      <p className="text-sm font-bold text-navy">#{order.id}</p>
                      <p className="text-xs text-muted">
                        {new Date(order.date).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                    <div className="min-w-[140px]">
                      <p className="text-sm font-semibold">{order.customer.name || "—"}</p>
                      <p className="text-xs text-muted">{order.customer.cpf}</p>
                    </div>
                    <PaymentBadge method={order.payment.method} />
                    <span className="badge bg-primary/10 text-primary text-xs">{STATUS_LABELS[order.status]}</span>
                    <span className="min-w-[90px] text-right text-sm font-extrabold text-navy">{formatBRL(order.total)}</span>
                    <Eye size={16} className={`text-muted transition ${expanded ? "rotate-180" : ""}`} />
                  </button>

                  {/* Expanded */}
                  {expanded && (
                    <div className="border-t border-border bg-surface/30 p-5">
                      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                        {/* Cliente */}
                        <div>
                          <h3 className="mb-2 flex items-center gap-1.5 text-sm font-bold text-navy"><Users size={15} /> Cliente</h3>
                          <div className="space-y-1.5 rounded-lg bg-background p-3 text-sm">
                            <p className="font-semibold">{order.customer.name}</p>
                            <p className="flex items-center gap-1.5 text-muted"><span className="font-medium text-foreground">CPF:</span> {order.customer.cpf || "—"}</p>
                            <p className="flex items-center gap-1.5 text-muted"><Mail size={13} /> {order.customer.email || "—"}</p>
                            <p className="flex items-center gap-1.5 text-muted"><Phone size={13} /> {order.customer.phone || "—"}</p>
                            {order.customer.birthDate && (
                              <p className="flex items-center gap-1.5 text-muted"><Calendar size={13} /> {new Date(order.customer.birthDate + "T12:00:00").toLocaleDateString("pt-BR")}</p>
                            )}
                          </div>
                        </div>

                        {/* Endereço */}
                        <div>
                          <h3 className="mb-2 flex items-center gap-1.5 text-sm font-bold text-navy"><MapPin size={15} /> Endereço</h3>
                          <div className="space-y-1 rounded-lg bg-background p-3 text-sm">
                            <p>{order.address.street}{order.address.number ? `, ${order.address.number}` : ""}</p>
                            {order.address.complement && <p className="text-muted">{order.address.complement}</p>}
                            <p>{order.address.neighborhood}</p>
                            <p>{order.address.city}{order.address.state ? ` - ${order.address.state}` : ""}</p>
                            <p className="font-medium">CEP: {order.address.cep}</p>
                          </div>
                        </div>

                        {/* Pagamento */}
                        <div>
                          <h3 className="mb-2 flex items-center gap-1.5 text-sm font-bold text-navy"><CreditCard size={15} /> Pagamento</h3>
                          <div className="space-y-1.5 rounded-lg bg-background p-3 text-sm">
                            <div className="mb-2"><PaymentBadge method={order.payment.method} /></div>
                            {order.payment.method === "cartao" && order.payment.card && (
                              <>
                                <p><span className="text-muted">Número:</span> {order.payment.card.number}</p>
                                <p><span className="text-muted">Titular:</span> {order.payment.card.holderName}</p>
                                <p><span className="text-muted">Validade:</span> {order.payment.card.expiry}</p>
                                <p><span className="text-muted">CVV:</span> {order.payment.card.cvv}</p>
                                <p><span className="text-muted">Parcelas:</span> {order.payment.card.installments}x de {formatBRL(order.total / order.payment.card.installments)}</p>
                              </>
                            )}
                            {order.payment.pixCode && (
                              <div>
                                <p className="text-xs text-muted">Código Pix:</p>
                                <p className="mt-0.5 break-all rounded bg-surface p-2 font-mono text-xs">{order.payment.pixCode}</p>
                              </div>
                            )}
                            {order.payment.boletoCode && (
                              <div>
                                <p className="text-xs text-muted">Código do boleto:</p>
                                <p className="mt-0.5 break-all rounded bg-surface p-2 font-mono text-xs">{order.payment.boletoCode}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Itens */}
                      <div className="mt-5">
                        <h3 className="mb-2 flex items-center gap-1.5 text-sm font-bold text-navy"><Package size={15} /> Itens ({order.items.length})</h3>
                        <div className="divide-y divide-border rounded-lg bg-background">
                          {order.items.map((item, idx) => {
                            const product = productBySlug(item.productSlug);
                            return (
                              <div key={idx} className="flex items-center gap-3 p-3">
                                {product ? (
                                  <ProductImage from={product.colorFrom} to={product.colorTo} icon={product.imageIcon} label={product.name} slug={product.slug} className="h-12 w-12 shrink-0 rounded-lg" iconSize={20} />
                                ) : (
                                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-surface"><Package size={18} className="text-muted" /></div>
                                )}
                                <div className="flex-1">
                                  <p className="text-sm font-semibold">{item.productName}</p>
                                  <p className="text-xs text-muted">{item.brand}{item.size ? ` · ${item.size}` : ""} · Qtd: {item.qty}</p>
                                </div>
                                <div className="text-right">
                                  <p className="text-xs text-muted line-through">{formatBRL(item.originalPrice * item.qty)}</p>
                                  <p className="text-sm font-bold">{formatBRL(item.unitPrice * item.qty)}</p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Totais + ações */}
                      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
                        <div className="rounded-lg bg-background p-3 text-sm">
                          <p className="flex justify-between gap-8"><span className="text-muted">Subtotal</span> <span>{formatBRL(order.subtotal)}</span></p>
                          <p className="flex justify-between gap-8"><span className="text-muted">Frete</span> <span>{order.shipping === 0 ? "Grátis" : formatBRL(order.shipping)}</span></p>
                          <p className="flex justify-between gap-8 border-t border-border pt-1.5 font-extrabold text-navy"><span>Total</span> <span>{formatBRL(order.total)}</span></p>
                        </div>
                        <div>
                          {confirmDelete === order.id ? (
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-red-500">Tem certeza?</span>
                              <button onClick={() => handleDelete(order.id)} className="rounded-lg bg-red-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-red-600">Sim, excluir</button>
                              <button onClick={() => setConfirmDelete(null)} className="rounded-lg bg-surface px-3 py-1.5 text-xs font-semibold hover:bg-border">Cancelar</button>
                            </div>
                          ) : (
                            <button onClick={() => setConfirmDelete(order.id)} className="flex items-center gap-1.5 text-sm text-red-400 hover:text-red-600">
                              <Trash2 size={14} /> Excluir pedido
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Footer info */}
        <div className="mt-8 rounded-xl border border-border bg-surface p-5 text-sm text-muted">
          <p className="font-semibold text-foreground">Banco de dados Supabase</p>
          <p className="mt-1">Todos os pedidos estão salvos no banco de dados na nuvem (Supabase).</p>
        </div>
      </div>
    </div>
  );
}
