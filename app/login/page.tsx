// FILE: app/login/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    setServerError(null);
    setSubmitting(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    setSubmitting(false);

    if (error) {
      // Zamerne generic sprava - nerozlisujeme "zly email" vs "zle heslo",
      // aby utocnik neschal zistovat, ktore emaily maju u nas ucet
      setServerError("Nesprávny email alebo heslo.");
      return;
    }

    router.push("/");
    router.refresh();
  };

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  return (
    <div className="max-w-sm mx-auto mt-24 px-4">
      <h1 className="text-xl font-semibold mb-6">Log in</h1>

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

        <div>
          <label className="block text-sm mb-1" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            {...register("password")}
            className="w-full rounded border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm"
          />
          {errors.password && (
            <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
          )}
        </div>

        {serverError && <p className="text-red-500 text-sm">{serverError}</p>}

        <button
            type="submit"
            disabled={submitting}
            className="w-full rounded bg-white text-black py-2 text-sm font-medium disabled:opacity-50"
            >
            {submitting ? (
                <span className="flex items-center justify-center gap-2">
                <svg
                    className="animate-spin h-4 w-4 text-black"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                >
                    <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    ></circle>
                    <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                </svg>
                <span>Logging in...</span>
                </span>
            ) : (
                "Log in"
            )}
            </button>
      </form>

      <div className="my-4 text-center text-xs text-neutral-500">or</div>

      <button
        onClick={handleGoogleLogin}
        className="w-full rounded border border-neutral-700 py-2 text-sm"
      >
        Continue with Google
      </button>

      <p className="text-xs text-neutral-500 mt-4 text-center">
        <a href="/forgot-password" className="underline">
          Forgot your password?
        </a>
      </p>

      <p className="text-xs text-neutral-500 mt-2 text-center">
        Don&apos;t have an account?{" "}
        <a href="/register" className="underline">
          Register
        </a>
      </p>
    </div>
  );
}