"use client";

import * as React from "react";
import Link from "next/link";
import { Compass, Lock, ArrowRight, User, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { loginAction, type LoginState } from "@/server/actions/auth-actions";

export function LoginForm() {
  const [state, formAction, pending] = React.useActionState<LoginState, FormData>(loginAction, {});

  return (
    <div className="min-h-screen bg-primary-950 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary-950 via-primary-900 to-primary-800 opacity-90" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(215,169,75,0.2),transparent_70%)]" />

      <div className="relative z-10 max-w-md w-full bg-white rounded-3xl p-8 sm:p-10 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-primary-800 text-secondary-500 flex items-center justify-center mx-auto shadow-md">
            <Compass className="w-7 h-7" />
          </div>
          <h1 className="font-brand text-2xl tracking-wide text-primary-950">Purbalingga Memikat</h1>
          <p className="text-xs text-stone-500 font-heading uppercase tracking-wider">
            Portal Masuk Administrator CMS
          </p>
        </div>

        <form action={formAction} className="space-y-4 text-xs font-body">
          <div>
            <label htmlFor="email" className="block font-semibold text-stone-700 mb-1">
              Email
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="username"
                className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:outline-none focus:border-primary-800"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block font-semibold text-stone-700 mb-1">
              Kata Sandi
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:outline-none focus:border-primary-800"
              />
            </div>
          </div>

          {state.error && (
            <div role="alert" className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{state.error}</span>
            </div>
          )}

          <Button type="submit" variant="secondary" size="md" disabled={pending} className="w-full shadow-md font-bold mt-2">
            <span>{pending ? "Memeriksa..." : "Masuk ke Panel CMS"}</span>
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>
        </form>

        <div className="border-t border-stone-100 pt-4 text-center">
          <Link href="/" className="text-xs text-primary-800 hover:underline">
            &larr; Kembali ke Website Publik
          </Link>
        </div>
      </div>
    </div>
  );
}
