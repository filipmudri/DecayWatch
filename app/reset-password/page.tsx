// FILE: app/reset-password/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  resetPasswordSchema,
  type ResetPasswordInput,
} from "@/lib/validations/auth";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const supabase = createClient();
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordInput) => {
    setServerError(null);
    setSubmitting(true);

    // V tomto bode uz je user docasne prihlaseny cez "recovery" session,
    // ktoru vytvoril /auth/callback vymenou tokenu z emailu
    const { error } = await supabase.auth.updateUser({
      password: data.password,
    });

    setSubmitting(false);

    if (error) {
      setServerError(
        "Nepodarilo sa zmeniť heslo. Skús požiadať o nový link."
      );
      return;
    }

    setDone(true);
    setTimeout(() => {
      router.push("/login");
    }, 2000);
  };

  if (done) {
    return (
      <div className="max-w-sm mx-auto mt-24 text-center px-4">
        <h1 className="text-xl font-semibold mb-2">Heslo zmenené</h1>
        <p className="text-sm text-neutral-400">
          Presmerúvam ťa na prihlásenie...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-sm mx-auto mt-24 px-4">
      <h1 className="text-xl font-semibold mb-6">Nastav nové heslo</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div>
          <label className="block text-sm mb-1" htmlFor="password">
            Nové heslo
          </label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            {...register("password")}
            className="w-full rounded border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm"
          />
          {errors.password && (
            <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm mb-1" htmlFor="confirmPassword">
            Potvrď nové heslo
          </label>
          <input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            {...register("confirmPassword")}
            className="w-full rounded border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm"
          />
          {errors.confirmPassword && (
            <p className="text-red-500 text-xs mt-1">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        {serverError && <p className="text-red-500 text-sm">{serverError}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded bg-white text-black py-2 text-sm font-medium disabled:opacity-50"
        >
          {submitting ? "Ukladám..." : "Zmeniť heslo"}
        </button>
      </form>
    </div>
  );
}