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

    // redirectTo points to /auth/callback, which exchanges the token for a
    // session and redirects the user to /reset-password to set a new password
    const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
    });

    setSubmitting(false);

    if (error) {
      // Deliberately generic - we don't want to reveal whether the email exists
      setServerError("Something went wrong. Please try again.");
      return;
    }

    // Same message even if the email doesn't exist - otherwise we'd let an
    // attacker enumerate which emails have an account with us
    setSent(true);
  };

  if (sent) {
    return (
      <div className="max-w-sm mx-auto mt-24 text-center px-4">
        <h1 className="text-xl font-semibold mb-2">Check your email</h1>
        <p className="text-sm text-neutral-400">
          If an account with that email exists, we&apos;ve sent a password
          reset link to it.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-sm mx-auto mt-24 px-4">
      <h1 className="text-xl font-semibold mb-2">Forgot password</h1>
      <p className="text-sm text-neutral-400 mb-6">
        Enter your email and we&apos;ll send you a password reset link.
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
          {submitting ? "Sending..." : "Send reset link"}
        </button>
      </form>

      <p className="text-xs text-neutral-500 mt-6 text-center">
        <a href="/login" className="underline">
          Back to login
        </a>
      </p>
    </div>
  );
}