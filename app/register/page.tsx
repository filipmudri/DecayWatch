"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, type RegisterInput } from "@/lib/validations/auth";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { TERMS_VERSION } from "@/lib/legal";

export default function RegisterPage() {
  const router = useRouter();
  const supabase = createClient();
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    trigger,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { acceptTerms: false },
  });

  const onSubmit = async (data: RegisterInput) => {
    setServerError(null);
    setSubmitting(true);

    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: { accepted_terms_version: TERMS_VERSION },
      },
    });

    if (error) {
      setSubmitting(false);
      setServerError("Registration failed. Please try again.");
      return;
    }

    router.push("/login");
  };

  const handleGoogleSignUp = async () => {
    if (!(await trigger("acceptTerms"))) return;
    setServerError(null);
    setSubmitting(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      setServerError("Google sign-in failed. Please try again.");
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page max-w-sm mx-auto mt-24 px-4">
      <h1 className="text-xl font-semibold mb-6">Create an Account</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div>
          <label className="block text-sm mb-1" htmlFor="email">
            Email address
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

        <div>
          <label className="block text-sm mb-1" htmlFor="password">
            Password
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
            Confirm password
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

        <div>
          <label className="flex items-start gap-3 text-sm leading-6" htmlFor="acceptTerms">
            <input id="acceptTerms" type="checkbox" {...register("acceptTerms")}
              aria-invalid={!!errors.acceptTerms} aria-describedby={errors.acceptTerms ? "terms-error" : undefined}
              className="mt-1.5 h-4 w-4 shrink-0 accent-[var(--gold)]" />
            <span>I agree to the <Link href="/terms" target="_blank" rel="noopener noreferrer" className="underline">Terms &amp; Conditions</Link>.</span>
          </label>
          {errors.acceptTerms && <p id="terms-error" role="alert" className="text-red-500 text-xs mt-1">{errors.acceptTerms.message}</p>}
          <p className="text-xs text-neutral-400 mt-2">See our <Link href="/privacy" target="_blank" rel="noopener noreferrer" className="underline">Privacy Policy</Link> for how we use your data. Google users confirm the terms after sign-in.</p>
        </div>

        {serverError && <p role="alert" className="text-red-500 text-sm">{serverError}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded bg-white text-black py-2 text-sm font-medium disabled:opacity-50"
        >
          {submitting ? "Creating account..." : "Sign Up"}
        </button>
      </form>

      <div className="my-4 text-center text-xs text-neutral-500">or</div>

      <button
        onClick={handleGoogleSignUp}
        disabled={submitting}
        className="w-full rounded border border-neutral-700 py-2 text-sm disabled:opacity-50"
      >
        Continue with Google
      </button>

      <p className="text-xs text-neutral-500 mt-6 text-center">
        Already have an account?{" "}
        <a href="/login" className="underline">
          Log in
        </a>
      </p>
    </div>
  );
}
