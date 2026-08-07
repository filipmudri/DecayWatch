// FILE: app/forgot-password/page.tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  forgotPasswordSchema,
  type ForgotPasswordInput,
} from "@/lib/validations/auth";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const supabase = createClient();
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordInput) => {
    setServerError(null);
    setSubmitting(true);

    // redirectTo smeruje na /auth/callback, ktore vymeni token za session
    // a presmeruje usera na /reset-password, kde si nastavi nove heslo
    const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
    });

    setSubmitting(false);

    if (error) {
      // Generic sprava zamerne - nechceme prezradzovat, ci email v systeme existuje
      setServerError("Niečo sa pokazilo. Skús to znova.");
      return;
    }

    // Zamerne rovnaka sprava aj ked email neexistuje - inak by sme
    // utocnikovi umoznili zistovat, ktore emaily maju u nas ucet
    setSent(true);
  };

  if (sent) {
    return (
      <div className="max-w-sm mx-auto mt-24 text-center px-4">
        <h1 className="text-xl font-semibold mb-2">Skontroluj svoj email</h1>
        <p className="text-sm text-neutral-400">
          Ak účet s týmto emailom existuje, poslali sme naň link na obnovenie
          hesla.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-sm mx-auto mt-24 px-4">
      <h1 className="text-xl font-semibold mb-2">Zabudnuté heslo</h1>
      <p className="text-sm text-neutral-400 mb-6">
        Zadaj svoj email a pošleme ti link na obnovenie hesla.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div>
          <label className="block text-sm mb-1" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            {...register("email")}
            className="w-full rounded border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm"
          />
          {errors.email && (
            <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
          )}
        </div>

        {serverError && <p className="text-red-500 text-sm">{serverError}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded bg-white text-black py-2 text-sm font-medium disabled:opacity-50"
        >
          {submitting ? "Odosielam..." : "Poslať link na obnovenie"}
        </button>
      </form>

      <p className="text-xs text-neutral-500 mt-6 text-center">
        <a href="/login" className="underline">
          Späť na prihlásenie
        </a>
      </p>
    </div>
  );
}