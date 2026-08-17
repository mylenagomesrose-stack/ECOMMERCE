"use client";

import { useState } from "react";
import Link from "next/link";
import { User, Mail, Lock, Eye, EyeOff, ShieldCheck, LogOut, Package, MapPin, Phone, CreditCard, ChevronRight } from "lucide-react";
import { useAuth, type Profile } from "@/context/AuthContext";

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

function onlyLetters(v: string) {
  return v.replace(/[^a-zA-ZÀ-ÿ\s]/g, "");
}

export default function ContaPage() {
  const { user, profile, loading, signIn, signUp, signOut } = useAuth();

  if (loading) {
    return (
      <div className="container-app flex justify-center py-16">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-border" style={{ borderTopColor: "var(--primary)" }} />
          <p className="mt-4 text-sm text-muted">Carregando...</p>
        </div>
      </div>
    );
  }

  if (user) return <Painel />;
  return <LoginCadastro />;
}

function LoginCadastro() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<"login" | "cadastro">("login");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [cpf, setCpf] = useState("");
  const [phone, setPhone] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!email || !password) { setError("Preencha e-mail e senha"); return; }

    if (mode === "cadastro") {
      if (!name.trim()) { setError("Nome é obrigatório"); return; }
      if (password.length < 6 || password.length > 15) { setError("Senha deve ter de 6 a 15 caracteres"); return; }
      if (password !== confirmPassword) { setError("As senhas não conferem"); return; }
    }

    setSubmitting(true);
    if (mode === "login") {
      const result = await signIn(email, password);
      if (result.error) setError(result.error);
    } else {
      const prof: Profile = { name, cpf, birthDate, phone };
      const result = await signUp(email, password, prof);
      if (result.error) setError(result.error);
    }
    setSubmitting(false);
  }

  return (
    <div className="container-app flex justify-center py-12">
      <div className="w-full max-w-md">
        <div className="card p-6 sm:p-8">
          <div className="mb-6 flex rounded-full bg-background p-1">
            {(["login", "cadastro"] as const).map((m) => (
              <button key={m} onClick={() => { setMode(m); setError(""); }} className={`flex-1 rounded-full py-2 text-sm font-semibold transition ${mode === m ? "bg-primary text-white shadow-sm" : "text-muted"}`}>
                {m === "login" ? "Entrar" : "Criar conta"}
              </button>
            ))}
          </div>

          <h1 className="mb-1 text-xl font-extrabold text-navy">
            {mode === "login" ? "Bem-vindo de volta" : "Crie sua conta"}
          </h1>
          <p className="mb-5 text-sm text-muted">
            {mode === "login" ? "Acesse seus pedidos e favoritos." : "É rápido e seguro. Seus dados são protegidos (LGPD)."}
          </p>

          {error && (
            <div className="mb-4 rounded-lg border p-3 text-sm font-semibold" style={{ borderColor: "#fca5a5", backgroundColor: "#fef2f2", color: "#b91c1c" }}>
              {error}
            </div>
          )}

          <form className="grid gap-4" onSubmit={handleSubmit}>
            {mode === "cadastro" && (
              <div>
                <label className="mb-1 block text-sm font-semibold">Nome completo</label>
                <div className="flex items-center rounded-lg border border-border bg-surface px-3 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
                  <User size={16} className="text-muted" />
                  <input type="text" placeholder="Seu nome" value={name} onChange={(e) => setName(onlyLetters(e.target.value))} className="w-full bg-transparent px-2 py-2.5 text-sm outline-none" />
                </div>
              </div>
            )}

            <div>
              <label className="mb-1 block text-sm font-semibold">E-mail</label>
              <div className="flex items-center rounded-lg border border-border bg-surface px-3 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
                <Mail size={16} className="text-muted" />
                <input type="email" placeholder="voce@email.com" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-transparent px-2 py-2.5 text-sm outline-none" />
              </div>
            </div>

            {mode === "cadastro" && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-semibold">CPF</label>
                  <div className="flex items-center rounded-lg border border-border bg-surface px-3 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
                    <input type="text" placeholder="000.000.000-00" value={cpf} onChange={(e) => setCpf(maskCPF(e.target.value))} className="w-full bg-transparent px-2 py-2.5 text-sm outline-none" />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold">Telefone</label>
                  <div className="flex items-center rounded-lg border border-border bg-surface px-3 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
                    <input type="text" placeholder="(00) 0 0000-0000" value={phone} onChange={(e) => setPhone(maskPhone(e.target.value))} className="w-full bg-transparent px-2 py-2.5 text-sm outline-none" />
                  </div>
                </div>
              </div>
            )}

            {mode === "cadastro" && (
              <div>
                <label className="mb-1 block text-sm font-semibold">Data de nascimento</label>
                <div className="flex items-center rounded-lg border border-border bg-surface px-3 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
                  <input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} className="w-full bg-transparent px-2 py-2.5 text-sm outline-none" />
                </div>
              </div>
            )}

            <div>
              <label className="mb-1 block text-sm font-semibold">Senha {mode === "cadastro" && <span className="font-normal text-muted">(6 a 15 caracteres)</span>}</label>
              <div className="flex items-center rounded-lg border border-border bg-surface px-3 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
                <Lock size={16} className="text-muted" />
                <input type={show ? "text" : "password"} placeholder="••••••••" maxLength={15} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-transparent px-2 py-2.5 text-sm outline-none" />
                <button type="button" aria-label="Mostrar senha" onClick={() => setShow((s) => !s)}>{show ? <EyeOff size={16} /> : <Eye size={16} />}</button>
              </div>
            </div>

            {mode === "cadastro" && (
              <div>
                <label className="mb-1 block text-sm font-semibold">Confirmar senha</label>
                <div className="flex items-center rounded-lg border border-border bg-surface px-3 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
                  <Lock size={16} className="text-muted" />
                  <input type="password" placeholder="••••••••" maxLength={15} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full bg-transparent px-2 py-2.5 text-sm outline-none" />
                </div>
              </div>
            )}

            <button type="submit" disabled={submitting} className="btn btn-primary w-full py-3 text-sm disabled:opacity-50">
              {submitting ? "Aguarde..." : mode === "login" ? "Entrar" : "Criar conta"}
            </button>
          </form>

          <p className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-muted"><ShieldCheck size={13} /> Conexão segura · dados criptografados</p>
        </div>
      </div>
    </div>
  );
}

function Painel() {
  const { user, profile, signOut } = useAuth();

  const menuItems = [
    { icon: Package, label: "Meus pedidos", desc: "Acompanhe seus pedidos", href: "/pedidos" },
    { icon: MapPin, label: "Endereços", desc: "Gerencie seus endereços", href: "/conta" },
    { icon: CreditCard, label: "Pagamentos", desc: "Formas de pagamento", href: "/conta" },
  ];

  return (
    <div className="container-app py-8">
      <h1 className="mb-6 text-2xl font-extrabold text-navy md:text-3xl">Minha conta</h1>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          {/* Dados do perfil */}
          <div className="card p-6">
            <h2 className="mb-4 text-lg font-bold">Dados pessoais</h2>
            <div className="grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <span className="text-xs text-muted">Nome</span>
                <p className="font-semibold">{profile?.name || "—"}</p>
              </div>
              <div>
                <span className="text-xs text-muted">E-mail</span>
                <p className="font-semibold">{user?.email || "—"}</p>
              </div>
              <div>
                <span className="text-xs text-muted">CPF</span>
                <p className="font-semibold">{profile?.cpf || "—"}</p>
              </div>
              <div>
                <span className="text-xs text-muted">Telefone</span>
                <p className="font-semibold">{profile?.phone || "—"}</p>
              </div>
              {profile?.birthDate && (
                <div>
                  <span className="text-xs text-muted">Data de nascimento</span>
                  <p className="font-semibold">{new Date(profile.birthDate + "T12:00:00").toLocaleDateString("pt-BR")}</p>
                </div>
              )}
            </div>
          </div>

          {/* Menu de navegação */}
          <div className="card overflow-hidden">
            {menuItems.map((item) => (
              <Link key={item.label} href={item.href} className="flex items-center gap-3 border-b border-border p-4 transition last:border-b-0 hover:bg-background">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-primary-light text-primary">
                  <item.icon size={18} />
                </span>
                <div className="flex-1">
                  <p className="text-sm font-semibold">{item.label}</p>
                  <p className="text-xs text-muted">{item.desc}</p>
                </div>
                <ChevronRight size={16} className="text-muted" />
              </Link>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <aside className="lg:sticky lg:top-40 lg:self-start">
          <div className="card p-5">
            <div className="mb-4 flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-full bg-primary text-white">
                <User size={20} />
              </div>
              <div>
                <p className="text-sm font-bold">{profile?.name || "Usuário"}</p>
                <p className="text-xs text-muted">{user?.email}</p>
              </div>
            </div>

            <div className="mb-4 rounded-lg bg-background p-3">
              <p className="text-xs text-muted">Membro desde</p>
              <p className="text-sm font-semibold">{user?.created_at ? new Date(user.created_at).toLocaleDateString("pt-BR", { month: "long", year: "numeric" }) : "—"}</p>
            </div>

            <button onClick={signOut} className="btn btn-outline w-full py-2.5 text-sm" style={{ color: "#dc2626", borderColor: "#fca5a5" }}>
              <LogOut size={16} /> Sair da conta
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
