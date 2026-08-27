"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2, Lock } from "lucide-react";
import { bookingClient } from "@/lib/booking-client";
import { IS_DEMO_MODE, withBasePath } from "@/lib/demo-mode";
import { DEMO_ADMIN } from "@/data/seed-data";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState(IS_DEMO_MODE ? DEMO_ADMIN.email : "");
  const [password, setPassword] = useState(IS_DEMO_MODE ? DEMO_ADMIN.password : "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await bookingClient.adminLogin(email.trim(), password);
    setLoading(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    const next = searchParams.get("next") || "/admin";
    router.push(next);
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="card-ivy w-full max-w-sm p-8">
        <div className="flex flex-col items-center text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={withBasePath("/images/logo.png")} alt="Ivy Beauty e Spa" className="h-11 w-auto" />
          <h1 className="mt-4 font-display text-xl text-charcoal">Painel administrativo</h1>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-charcoal" htmlFor="email">E-mail</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1.5 w-full rounded-xl border border-charcoal/15 bg-ivory px-4 py-3 text-sm outline-none focus:border-rose-deep"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-charcoal" htmlFor="password">Senha</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1.5 w-full rounded-xl border border-charcoal/15 bg-ivory px-4 py-3 text-sm outline-none focus:border-rose-deep"
            />
          </div>
          {error && <p className="text-sm text-rose-deep">{error}</p>}
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Lock size={16} />}
            Entrar
          </button>
        </form>

        {IS_DEMO_MODE && (
          <p className="mt-5 rounded-xl bg-blush-soft p-3 text-center text-xs text-charcoal-soft">
            Modo demonstração — login pré-preenchido ({DEMO_ADMIN.email}). Não é uma autenticação real.
          </p>
        )}

        <Link href="/" className="mt-6 block text-center text-xs text-charcoal-soft hover:text-rose-deep">
          ← Voltar ao site
        </Link>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
