"use client";

import { useState } from "react";
import Link from "next/link";
import { User, Mail, Lock, Eye, EyeOff, ShieldCheck } from "lucide-react";

export default function ContaPage() {
  const [mode, setMode] = useState<"login" | "cadastro">("login");
  const [show, setShow] = useState(false);

  return (
    <div className="container-app flex justify-center py-12">
      <div className="w-full max-w-md">
        <div className="card p-6 sm:p-8">
          <div className="mb-6 flex rounded-full bg-background p-1">
            {(["login", "cadastro"] as const).map((m) => (
              <button key={m} onClick={() => setMode(m)} className={`flex-1 rounded-full py-2 text-sm font-semibold transition ${mode === m ? "bg-primary text-white shadow-sm" : "text-muted"}`}>
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

          <form className="grid gap-4" onSubmit={(e) => e.preventDefault()}>
            {mode === "cadastro" && (
              <Input icon={User} label="Nome completo" placeholder="Seu nome" />
            )}
            <Input icon={Mail} label="E-mail" type="email" placeholder="voce@email.com" />
            {mode === "cadastro" && (
              <div className="grid grid-cols-2 gap-4">
                <Input label="CPF" placeholder="000.000.000-00" />
                <Input label="Telefone" placeholder="(00) 00000-0000" />
              </div>
            )}
            <div>
              <label className="mb-1 block text-sm font-semibold">Senha</label>
              <div className="flex items-center rounded-lg border border-border bg-surface px-3 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
                <Lock size={16} className="text-muted" />
                <input type={show ? "text" : "password"} placeholder="••••••••" className="w-full bg-transparent px-2 py-2.5 text-sm outline-none" />
                <button type="button" aria-label="Mostrar senha" onClick={() => setShow((s) => !s)}>{show ? <EyeOff size={16} /> : <Eye size={16} />}</button>
              </div>
            </div>
            {mode === "cadastro" && <Input icon={Lock} label="Confirmar senha" type="password" placeholder="••••••••" />}

            {mode === "login" ? (
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2"><input type="checkbox" className="accent-[var(--primary)]" /> Permanecer conectado</label>
                <Link href="/conta" className="text-primary hover:underline">Esqueci minha senha</Link>
              </div>
            ) : (
              <label className="flex items-start gap-2 text-xs text-muted">
                <input type="checkbox" className="mt-0.5 accent-[var(--primary)]" />
                Li e aceito os <Link href="/termos" className="text-primary hover:underline">Termos de uso</Link> e a <Link href="/privacidade" className="text-primary hover:underline">Política de privacidade</Link>.
              </label>
            )}

            <button className="btn btn-primary w-full py-3 text-sm">{mode === "login" ? "Entrar" : "Criar conta"}</button>
          </form>

          <p className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-muted"><ShieldCheck size={13} /> Conexão segura · dados criptografados (demonstração)</p>
        </div>
      </div>
    </div>
  );
}

function Input({ icon: Icon, label, type = "text", placeholder }: { icon?: React.ComponentType<{ size?: number; className?: string }>; label: string; type?: string; placeholder?: string }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-semibold">{label}</label>
      <div className="flex items-center rounded-lg border border-border bg-surface px-3 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
        {Icon && <Icon size={16} className="text-muted" />}
        <input type={type} placeholder={placeholder} className="w-full bg-transparent px-2 py-2.5 text-sm outline-none" />
      </div>
    </div>
  );
}
