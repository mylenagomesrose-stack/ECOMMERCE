"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  User, MapPin, Truck, CreditCard, CheckCircle2, QrCode, Barcode, Copy, ShieldCheck, ChevronLeft, ChevronRight, Lock, Eye, EyeOff, Loader2,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { formatBRL } from "@/lib/format";
import { finalPrice, listPrice } from "@/lib/pricing";
import { saveOrder, type Order, type OrderCustomer, type OrderAddress, type OrderPayment, type OrderCardPayment } from "@/lib/orders";

const STEPS = [
  { icon: User, label: "Identificação" },
  { icon: MapPin, label: "Endereço" },
  { icon: Truck, label: "Entrega" },
  { icon: CreditCard, label: "Pagamento" },
  { icon: CheckCircle2, label: "Confirmação" },
];

// ——— Masks ———

function maskCPF(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`;
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
}

function maskPhone(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : "";
  if (d.length <= 3) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2, 3)} ${d.slice(3)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 3)} ${d.slice(3, 7)}-${d.slice(7)}`;
}

function maskCEP(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 8);
  if (d.length <= 5) return d;
  return `${d.slice(0, 5)}-${d.slice(5)}`;
}

function maskCardNumber(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 16);
  return d.replace(/(.{4})/g, "$1 ").trim();
}

function maskExpiry(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 4);
  if (d.length <= 2) return d;
  return `${d.slice(0, 2)}/${d.slice(2)}`;
}

function maskCVV(v: string) {
  return v.replace(/\D/g, "").slice(0, 4);
}

function onlyLetters(v: string) {
  return v.replace(/[^a-zA-ZÀ-ÿ\s]/g, "");
}

function onlyNumbers(v: string) {
  return v.replace(/\D/g, "");
}

// ——— Validation ———

function isValidCPF(cpf: string) {
  return cpf.replace(/\D/g, "").length === 11;
}

function isValidPhone(phone: string) {
  return phone.replace(/\D/g, "").length === 11;
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidExpiry(expiry: string) {
  const parts = expiry.split("/");
  if (parts.length !== 2) return false;
  const month = parseInt(parts[0], 10);
  const year = parseInt(parts[1], 10);
  if (month < 1 || month > 12) return false;
  const now = new Date();
  const currentYear = now.getFullYear() % 100;
  const currentMonth = now.getMonth() + 1;
  if (year < currentYear) return false;
  if (year === currentYear && month < currentMonth) return false;
  return true;
}

export default function CheckoutPage() {
  const { detailed, subtotal, clear } = useCart();
  const { user, profile, signUp, signIn } = useAuth();

  const [step, setStep] = useState(0);
  const [savedOrder, setSavedOrder] = useState<Order | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [authMode, setAuthMode] = useState<"criar" | "entrar">("criar");

  // --- Identificação ---
  const [customer, setCustomer] = useState<OrderCustomer>({
    name: "", cpf: "", birthDate: "", email: "", phone: "",
  });
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (user && profile) {
      setCustomer({
        name: profile.name || "",
        cpf: profile.cpf || "",
        birthDate: profile.birthDate || "",
        email: user.email || "",
        phone: profile.phone || "",
      });
      setAuthMode("entrar");
    }
  }, [user, profile]);

  // --- Endereço ---
  const [address, setAddress] = useState<OrderAddress>({
    cep: "", street: "", number: "", complement: "", neighborhood: "", city: "", state: "", country: "Brasil",
  });
  const [cepLoading, setCepLoading] = useState(false);

  // --- Entrega ---
  const [deliveryMethod, setDeliveryMethod] = useState("padrao");

  // --- Pagamento ---
  const [paymentMethod, setPaymentMethod] = useState<"pix" | "cartao" | "boleto">("pix");
  const [card, setCard] = useState<OrderCardPayment>({
    number: "", holderName: "", expiry: "", cvv: "", installments: 1,
  });

  const frete = deliveryMethod === "padrao" && subtotal > 0 && subtotal < 500 ? 49.9 : 0;
  const total = subtotal + frete;

  if (detailed.length === 0 && step < 4) {
    return (
      <div className="container-app py-16 text-center">
        <p className="text-lg font-semibold">Seu carrinho está vazio.</p>
        <Link href="/produtos" className="btn btn-primary mt-4 px-6 py-3 text-sm">Ver produtos</Link>
      </div>
    );
  }

  function updateCustomer(field: keyof OrderCustomer, value: string) {
    setCustomer((prev) => ({ ...prev, [field]: value }));
  }
  function updateAddress(field: keyof OrderAddress, value: string) {
    setAddress((prev) => ({ ...prev, [field]: value }));
  }
  function updateCard(field: keyof OrderCardPayment, value: string | number) {
    setCard((prev) => ({ ...prev, [field]: value }));
  }

  // --- CEP auto-fill ---
  async function fetchCEP(cep: string) {
    const digits = cep.replace(/\D/g, "");
    if (digits.length !== 8) return;
    setCepLoading(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
      const data = await res.json();
      if (!data.erro) {
        setAddress((prev) => ({
          ...prev,
          street: data.logradouro || prev.street,
          neighborhood: data.bairro || prev.neighborhood,
          city: data.localidade || prev.city,
          state: data.uf || prev.state,
          country: "Brasil",
        }));
      }
    } catch { /* silently fail */ }
    setCepLoading(false);
  }

  // --- Validation per step ---
  function validateStep0(): string[] {
    const errs: string[] = [];
    if (user) {
      if (!customer.name.trim()) errs.push("Nome completo é obrigatório");
      else if (customer.name.trim().length < 3) errs.push("Nome deve ter pelo menos 3 caracteres");
      if (!isValidCPF(customer.cpf)) errs.push("CPF deve ter 11 dígitos");
      if (!customer.birthDate) errs.push("Data de nascimento é obrigatória");
      if (!isValidEmail(customer.email)) errs.push("E-mail inválido");
      if (!isValidPhone(customer.phone)) errs.push("Telefone deve ter 11 dígitos");
    } else if (authMode === "criar") {
      if (!customer.name.trim()) errs.push("Nome completo é obrigatório");
      else if (customer.name.trim().length < 3) errs.push("Nome deve ter pelo menos 3 caracteres");
      if (!isValidCPF(customer.cpf)) errs.push("CPF deve ter 11 dígitos");
      if (!customer.birthDate) errs.push("Data de nascimento é obrigatória");
      if (!isValidEmail(customer.email)) errs.push("E-mail inválido");
      if (!isValidPhone(customer.phone)) errs.push("Telefone deve ter 11 dígitos");
      if (password.length < 6 || password.length > 15) errs.push("Senha deve ter de 6 a 15 caracteres");
    } else {
      if (!isValidEmail(customer.email)) errs.push("E-mail inválido");
      if (!password) errs.push("Senha é obrigatória");
    }
    return errs;
  }

  function validateStep1(): string[] {
    const errs: string[] = [];
    if (address.cep.replace(/\D/g, "").length !== 8) errs.push("CEP deve ter 8 dígitos");
    if (!address.street.trim()) errs.push("Rua é obrigatória");
    if (!address.number.trim()) errs.push("Número é obrigatório");
    if (!address.neighborhood.trim()) errs.push("Bairro é obrigatório");
    if (!address.city.trim()) errs.push("Cidade é obrigatória");
    if (!address.state.trim()) errs.push("Estado é obrigatório");
    return errs;
  }

  function validateStep3(): string[] {
    if (paymentMethod !== "cartao") return [];
    const errs: string[] = [];
    if (card.number.replace(/\D/g, "").length < 13) errs.push("Número do cartão inválido");
    if (!card.holderName.trim()) errs.push("Nome no cartão é obrigatório");
    if (!isValidExpiry(card.expiry)) errs.push("Validade inválida ou expirada");
    if (card.cvv.length < 3) errs.push("CVV deve ter pelo menos 3 dígitos");
    return errs;
  }

  async function next() {
    let errs: string[] = [];
    if (step === 0) {
      errs = validateStep0();
      if (errs.length === 0 && !user) {
        if (authMode === "criar") {
          const result = await signUp(customer.email, password, {
            name: customer.name, cpf: customer.cpf, birthDate: customer.birthDate, phone: customer.phone,
          });
          if (result.error) { setErrors([result.error]); return; }
        } else {
          const result = await signIn(customer.email, password);
          if (result.error) { setErrors([result.error]); return; }
        }
      }
    } else if (step === 1) {
      errs = validateStep1();
    }
    setErrors(errs);
    if (errs.length === 0) setStep((s) => Math.min(4, s + 1));
  }

  function back() {
    setErrors([]);
    setStep((s) => Math.max(0, s - 1));
  }

  async function finish() {
    const errs = validateStep3();
    setErrors(errs);
    if (errs.length > 0) return;

    const payment: OrderPayment = {
      method: paymentMethod,
      card: paymentMethod === "cartao" ? { ...card } : undefined,
    };

    const items = detailed.map(({ line, product }) => ({
      productId: product.id,
      productName: product.name,
      productSlug: product.slug,
      brand: product.brand,
      size: line.size,
      qty: line.qty,
      unitPrice: finalPrice(product),
      originalPrice: listPrice(product),
    }));

    const order = await saveOrder(
      customer,
      address,
      deliveryMethod === "padrao" ? "Entrega padrão" : "Retirar no local",
      frete,
      payment,
      items,
      subtotal,
      frete,
      total,
      user?.id,
    );

    setSavedOrder(order);
    setStep(4);
    clear();
  }

  const displayOrder = savedOrder;

  return (
    <div className="container-app py-8">
      <h1 className="mb-6 text-2xl font-extrabold text-navy md:text-3xl">Finalizar compra</h1>

      {/* Stepper */}
      <ol className="mb-8 flex items-center">
        {STEPS.map((s, i) => (
          <li key={s.label} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center gap-1">
              <span className={`grid h-10 w-10 place-items-center rounded-full border-2 ${i <= step ? "border-primary bg-primary text-white" : "border-border bg-surface text-muted"}`}>
                <s.icon size={18} />
              </span>
              <span className={`hidden text-xs font-semibold sm:block ${i <= step ? "text-primary-dark" : "text-muted"}`}>{s.label}</span>
            </div>
            {i < STEPS.length - 1 && <span className={`mx-2 h-0.5 flex-1 ${i < step ? "bg-primary" : "bg-border"}`} />}
          </li>
        ))}
      </ol>

      {/* Errors */}
      {errors.length > 0 && (
        <div className="mb-4 rounded-xl border p-4" style={{ borderColor: "#fca5a5", backgroundColor: "#fef2f2" }}>
          <p className="mb-1 text-sm font-bold" style={{ color: "#b91c1c" }}>Corrija os seguintes campos:</p>
          <ul className="list-inside list-disc text-sm" style={{ color: "#dc2626" }}>
            {errors.map((e) => <li key={e}>{e}</li>)}
          </ul>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="card p-6">
          {/* STEP 0 — Identificação */}
          {step === 0 && (
            <Section title="Identificação">
              {user ? (
                <div className="rounded-lg border border-border bg-background p-3 text-sm">
                  <p className="font-semibold text-navy">Logado como {profile?.name || user.email}</p>
                  <p className="text-xs text-muted">Os campos foram preenchidos automaticamente com seus dados.</p>
                </div>
              ) : (
                <div className="mb-2 flex rounded-full bg-background p-1">
                  {(["criar", "entrar"] as const).map((m) => (
                    <button key={m} onClick={() => { setAuthMode(m); setErrors([]); }} className={`flex-1 rounded-full py-2 text-sm font-semibold transition ${authMode === m ? "bg-primary text-white shadow-sm" : "text-muted"}`}>
                      {m === "criar" ? "Criar conta" : "Já tenho conta"}
                    </button>
                  ))}
                </div>
              )}

              {authMode === "criar" && !user && (
                <>
                  <Field label="Nome completo *" value={customer.name} onChange={(v) => updateCustomer("name", onlyLetters(v))} placeholder="Seu nome completo" />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="CPF *" value={customer.cpf} onChange={(v) => updateCustomer("cpf", maskCPF(v))} placeholder="000.000.000-00" />
                    <Field label="Data de nascimento *" value={customer.birthDate} onChange={(v) => updateCustomer("birthDate", v)} type="date" />
                  </div>
                  <Field label="E-mail *" value={customer.email} onChange={(v) => updateCustomer("email", v)} type="email" placeholder="voce@email.com" />
                  <Field label="Telefone *" value={customer.phone} onChange={(v) => updateCustomer("phone", maskPhone(v))} placeholder="(00) 0 0000-0000" />
                  <div>
                    <label className="mb-1 block text-sm font-semibold">Criar senha * <span className="font-normal text-muted">(6 a 15 caracteres)</span></label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Crie sua senha"
                        value={password}
                        maxLength={15}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 pr-10 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground">
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    <p className="mt-1 text-xs text-muted">{password.length}/15 caracteres</p>
                  </div>
                </>
              )}

              {authMode === "entrar" && !user && (
                <>
                  <Field label="E-mail *" value={customer.email} onChange={(v) => updateCustomer("email", v)} type="email" placeholder="voce@email.com" />
                  <div>
                    <label className="mb-1 block text-sm font-semibold">Senha *</label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Sua senha"
                        value={password}
                        maxLength={15}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 pr-10 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground">
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                </>
              )}

              {user && (
                <>
                  <Field label="Nome completo *" value={customer.name} onChange={(v) => updateCustomer("name", onlyLetters(v))} placeholder="Seu nome completo" />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="CPF *" value={customer.cpf} onChange={(v) => updateCustomer("cpf", maskCPF(v))} placeholder="000.000.000-00" />
                    <Field label="Data de nascimento *" value={customer.birthDate} onChange={(v) => updateCustomer("birthDate", v)} type="date" />
                  </div>
                  <Field label="E-mail *" value={customer.email} onChange={(v) => updateCustomer("email", v)} type="email" placeholder="voce@email.com" />
                  <Field label="Telefone *" value={customer.phone} onChange={(v) => updateCustomer("phone", maskPhone(v))} placeholder="(00) 0 0000-0000" />
                </>
              )}
            </Section>
          )}

          {/* STEP 1 — Endereço */}
          {step === 1 && (
            <Section title="Endereço de entrega">
              <div className="grid gap-4 sm:grid-cols-[1fr_2fr]">
                <div>
                  <label className="mb-1 block text-sm font-semibold">CEP *</label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="00000-000"
                      value={address.cep}
                      onChange={(e) => {
                        const masked = maskCEP(e.target.value);
                        updateAddress("cep", masked);
                        if (masked.replace(/\D/g, "").length === 8) fetchCEP(masked);
                      }}
                      className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                    {cepLoading && <Loader2 size={16} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-primary" />}
                  </div>
                </div>
                <Field label="Rua / Logradouro *" value={address.street} onChange={(v) => updateAddress("street", v)} placeholder="Nome da rua" />
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <Field label="Número *" value={address.number} onChange={(v) => updateAddress("number", v)} placeholder="123" />
                <Field label="Complemento" value={address.complement} onChange={(v) => updateAddress("complement", v)} placeholder="Apto, bloco..." />
                <Field label="Bairro *" value={address.neighborhood} onChange={(v) => updateAddress("neighborhood", v)} placeholder="Bairro" />
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <Field label="Cidade *" value={address.city} onChange={(v) => updateAddress("city", v)} placeholder="Cidade" />
                <Field label="Estado *" value={address.state} onChange={(v) => updateAddress("state", v)} placeholder="UF" />
                <Field label="País" value={address.country} onChange={(v) => updateAddress("country", v)} placeholder="Brasil" />
              </div>
            </Section>
          )}

          {/* STEP 2 — Entrega */}
          {step === 2 && (
            <Section title="Forma de entrega">
              {([
                { key: "padrao", label: "Entrega padrão", desc: "Prazo estimado: até 4 dias de preparação + até 6 dias de transporte", price: subtotal < 500 ? 49.9 : 0 },
                { key: "retirada", label: "Retirar no local", desc: "Sujeito à disponibilidade — a combinar com a equipe", price: 0 },
              ] as const).map((opt) => (
                <label key={opt.key} className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 ${deliveryMethod === opt.key ? "border-primary bg-primary-light" : "border-border"}`}>
                  <input type="radio" name="entrega" checked={deliveryMethod === opt.key} onChange={() => setDeliveryMethod(opt.key)} className="accent-[var(--primary)]" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{opt.label}</p>
                    <p className="text-xs text-muted">{opt.desc}</p>
                  </div>
                  <span className="text-sm font-bold">{opt.price === 0 ? "Grátis" : formatBRL(opt.price)}</span>
                </label>
              ))}
              <p className="rounded-lg bg-background p-3 text-xs text-muted">
                Os prazos são estimativas e podem variar conforme a transportadora e a região.
              </p>
            </Section>
          )}

          {/* STEP 3 — Pagamento */}
          {step === 3 && (
            <Section title="Pagamento">
              <div className="flex gap-2">
                {([["pix", QrCode, "Pix"], ["cartao", CreditCard, "Cartão"], ["boleto", Barcode, "Boleto"]] as const).map(([key, Ic, label]) => (
                  <button key={key} onClick={() => setPaymentMethod(key)} className={`flex flex-1 flex-col items-center gap-1 rounded-xl border p-3 text-sm font-semibold transition ${paymentMethod === key ? "border-primary bg-primary-light text-primary-dark" : "border-border"}`}>
                    <Ic size={20} /> {label}
                  </button>
                ))}
              </div>

              {paymentMethod === "pix" && (
                <div className="flex flex-col items-center gap-3 rounded-xl border border-border p-5 text-center">
                  <div className="grid h-40 w-40 place-items-center rounded-lg bg-navy text-white"><QrCode size={110} /></div>
                  <p className="text-sm text-muted">Escaneie o QR Code ou use o código copia e cola.</p>
                  <button className="btn btn-outline px-4 py-2 text-xs"><Copy size={14} /> Copiar código Pix</button>
                  <p className="text-xs text-muted">O código Pix será gerado ao confirmar o pedido.</p>
                </div>
              )}

              {paymentMethod === "cartao" && (
                <div className="grid gap-4">
                  <Field label="Número do cartão *" value={card.number} onChange={(v) => updateCard("number", maskCardNumber(v))} placeholder="0000 0000 0000 0000" />
                  <Field label="Nome no cartão *" value={card.holderName} onChange={(v) => updateCard("holderName", onlyLetters(v))} placeholder="Como impresso no cartão" />
                  <div className="grid grid-cols-3 gap-4">
                    <Field label="Validade *" value={card.expiry} onChange={(v) => updateCard("expiry", maskExpiry(v))} placeholder="MM/AA" />
                    <Field label="CVV *" value={card.cvv} onChange={(v) => updateCard("cvv", maskCVV(v))} placeholder="123" />
                    <div>
                      <label className="mb-1 block text-sm font-semibold">Parcelas</label>
                      <select
                        value={card.installments}
                        onChange={(e) => updateCard("installments", Number(e.target.value))}
                        className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm outline-none focus:border-primary"
                      >
                        {Array.from({ length: 12 }).map((_, i) => (
                          <option key={i} value={i + 1}>{i + 1}x de {formatBRL(total / (i + 1))}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <p className="flex items-center gap-1.5 text-xs text-muted"><Lock size={13} /> Pagamento processado de forma segura.</p>
                </div>
              )}

              {paymentMethod === "boleto" && (
                <div className="rounded-xl border border-border p-5 text-center">
                  <Barcode size={64} className="mx-auto text-navy" />
                  <p className="mt-2 text-sm text-muted">O boleto será gerado ao confirmar o pedido. Vencimento em 3 dias úteis.</p>
                </div>
              )}
            </Section>
          )}

          {/* STEP 4 — Confirmação */}
          {step === 4 && displayOrder && (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <CheckCircle2 size={64} className="text-success" />
              <h2 className="text-2xl font-extrabold text-navy">Pedido realizado com sucesso!</h2>
              <p className="text-sm text-muted">Todos os dados foram salvos.</p>

              <div className="mt-2 w-full max-w-md rounded-xl border border-border p-4 text-left text-sm">
                <h3 className="mb-2 font-bold text-navy">Dados do pedido</h3>
                <p className="flex justify-between"><span className="text-muted">Pedido</span> <strong>#{displayOrder.id}</strong></p>
                <p className="flex justify-between"><span className="text-muted">Data</span> <strong>{new Date(displayOrder.date).toLocaleDateString("pt-BR")}</strong></p>
                <p className="flex justify-between"><span className="text-muted">Total</span> <strong>{formatBRL(displayOrder.total)}</strong></p>
                <p className="flex justify-between"><span className="text-muted">Pagamento</span> <strong className="capitalize">{displayOrder.payment.method}</strong></p>
                <p className="flex justify-between"><span className="text-muted">Entrega</span> <strong>{displayOrder.delivery.method}</strong></p>

                <h3 className="mb-2 mt-4 font-bold text-navy">Cliente</h3>
                <p className="flex justify-between"><span className="text-muted">Nome</span> <strong>{displayOrder.customer.name || "—"}</strong></p>
                <p className="flex justify-between"><span className="text-muted">CPF</span> <strong>{displayOrder.customer.cpf || "—"}</strong></p>
                <p className="flex justify-between"><span className="text-muted">E-mail</span> <strong>{displayOrder.customer.email || "—"}</strong></p>
                <p className="flex justify-between"><span className="text-muted">Telefone</span> <strong>{displayOrder.customer.phone || "—"}</strong></p>

                <h3 className="mb-2 mt-4 font-bold text-navy">Endereço</h3>
                <p className="text-sm">
                  {displayOrder.address.street}{displayOrder.address.number ? `, ${displayOrder.address.number}` : ""}
                  {displayOrder.address.complement ? ` — ${displayOrder.address.complement}` : ""}
                </p>
                <p className="text-sm text-muted">
                  {displayOrder.address.neighborhood}{displayOrder.address.city ? `, ${displayOrder.address.city}` : ""}
                  {displayOrder.address.state ? ` - ${displayOrder.address.state}` : ""} · CEP: {displayOrder.address.cep || "—"}
                </p>

                {displayOrder.payment.method === "cartao" && displayOrder.payment.card && (
                  <>
                    <h3 className="mb-2 mt-4 font-bold text-navy">Cartão</h3>
                    <p className="flex justify-between"><span className="text-muted">Final</span> <strong>****{displayOrder.payment.card.number.replace(/\D/g, "").slice(-4)}</strong></p>
                    <p className="flex justify-between"><span className="text-muted">Titular</span> <strong>{displayOrder.payment.card.holderName || "—"}</strong></p>
                    <p className="flex justify-between"><span className="text-muted">Parcelas</span> <strong>{displayOrder.payment.card.installments}x de {formatBRL(displayOrder.total / displayOrder.payment.card.installments)}</strong></p>
                  </>
                )}

                {displayOrder.payment.pixCode && (
                  <>
                    <h3 className="mb-2 mt-4 font-bold text-navy">Pix</h3>
                    <p className="break-all rounded bg-background p-2 text-xs font-mono">{displayOrder.payment.pixCode}</p>
                  </>
                )}

                {displayOrder.payment.boletoCode && (
                  <>
                    <h3 className="mb-2 mt-4 font-bold text-navy">Boleto</h3>
                    <p className="break-all rounded bg-background p-2 text-xs font-mono">{displayOrder.payment.boletoCode}</p>
                  </>
                )}

                <h3 className="mb-2 mt-4 font-bold text-navy">Itens ({displayOrder.items.length})</h3>
                <ul className="space-y-1">
                  {displayOrder.items.map((item, idx) => (
                    <li key={idx} className="flex justify-between text-xs">
                      <span className="text-muted">{item.qty}x {item.productName}</span>
                      <span className="font-semibold">{formatBRL(item.unitPrice * item.qty)}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-3 rounded-lg p-3 text-xs" style={{ backgroundColor: "#f0fdf4", color: "#166534" }}>
                Pedido salvo com sucesso no banco de dados.
              </div>

              <Link href="/pedidos" className="btn btn-primary mt-3 px-6 py-3 text-sm">Ver meus pedidos <ChevronRight size={18} /></Link>
              <Link href="/produtos" className="text-sm text-primary hover:underline">Continuar comprando</Link>
            </div>
          )}

          {step < 4 && (
            <div className="mt-6 flex items-center justify-between">
              <button onClick={back} disabled={step === 0} className="btn btn-outline px-5 py-2.5 text-sm disabled:opacity-40"><ChevronLeft size={16} /> Voltar</button>
              {step < 3 ? (
                <button onClick={next} className="btn btn-primary px-6 py-2.5 text-sm">Continuar <ChevronRight size={16} /></button>
              ) : (
                <button onClick={finish} className="btn btn-accent px-6 py-2.5 text-sm">Confirmar pedido <CheckCircle2 size={16} /></button>
              )}
            </div>
          )}
        </div>

        {/* Resumo lateral */}
        {step < 4 && (
          <aside className="lg:sticky lg:top-40 lg:self-start">
            <div className="card p-5">
              <h2 className="mb-3 font-bold">Resumo</h2>
              <ul className="mb-3 space-y-2 text-sm">
                {detailed.map(({ line, product }) => (
                  <li key={`${product.id}-${line.size}`} className="flex justify-between gap-2">
                    <span className="line-clamp-1 text-muted">{line.qty}x {product.name}</span>
                    <span className="shrink-0 font-semibold">{formatBRL(finalPrice(product) * line.qty)}</span>
                  </li>
                ))}
              </ul>
              <dl className="space-y-1 border-t border-border pt-3 text-sm">
                <div className="flex justify-between"><dt className="text-muted">Subtotal</dt><dd>{formatBRL(subtotal)}</dd></div>
                <div className="flex justify-between"><dt className="text-muted">Frete</dt><dd>{frete === 0 ? "Grátis" : formatBRL(frete)}</dd></div>
                <div className="flex justify-between border-t border-border pt-2 text-base font-bold"><dt>Total</dt><dd className="text-navy">{formatBRL(total)}</dd></div>
              </dl>
              <p className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-muted"><ShieldCheck size={13} /> Ambiente seguro · LGPD</p>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="mb-4 text-lg font-bold">{title}</h2>
      <div className="grid gap-4">{children}</div>
    </div>
  );
}

function Field({ label, type = "text", placeholder, value, onChange }: {
  label: string; type?: string; placeholder?: string; value: string; onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-semibold">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
      />
    </div>
  );
}
