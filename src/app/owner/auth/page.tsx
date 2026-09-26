"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-provider";

function AuthForm() {
  const { client, loading } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const redirectTo = params.get("redirect") || "/owner/config";

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!client) {
      setError("Supabase is not configured.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const result =
        mode === "signin"
          ? await client.auth.signInWithPassword({ email, password })
          : await client.auth.signUp({ email, password });

      if (result.error) {
        setError(result.error.message);
      } else if (mode === "signup" && !result.data.session) {
        setError("Check your email to confirm your account, then sign in.");
        setMode("signin");
      } else {
        router.push(redirectTo);
      }
    } catch {
      setError("Network error - please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-5 py-12 text-foreground">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <p className="mb-2 text-xs uppercase tracking-[0.24em] text-gold">
            Owner studio
          </p>
          <h1 className="font-display text-3xl font-medium">
            {mode === "signin" ? "Welcome back" : "Create your account"}
          </h1>
          <p className="mt-2 text-sm text-muted">
            {mode === "signin"
              ? "Sign in to manage your homestay."
              : "Set up your homestay owner account."}
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-2xl border border-line bg-surface p-6 shadow-[var(--shadow-soft)]"
        >
          <label className="block">
            <span className="mb-1 block text-sm font-medium">Email</span>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="control"
              placeholder="owner@example.com"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium">Password</span>
            <input
              type="password"
              required
              minLength={8}
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="control"
            />
          </label>

          {error && (
            <p className="rounded-lg border border-red-400/30 bg-red-400/10 px-3 py-2 text-sm text-red-300">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background transition-colors hover:bg-gold disabled:opacity-60"
          >
            {submitting
              ? "Please wait..."
              : mode === "signin"
                ? "Sign in"
                : "Create account"}
          </button>
        </form>

        <button
          type="button"
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          className="mt-4 w-full text-center text-sm text-muted transition-colors hover:text-foreground"
        >
          {mode === "signin"
            ? "Don't have an account? Sign up"
            : "Already have an account? Sign in"}
        </button>

        {!client && !loading && (
          <p className="mt-6 text-center text-xs text-muted">
            Demo mode - Supabase auth is not configured. Set
            NEXT_PUBLIC_SUPABASE_ANON_KEY in your environment.
          </p>
        )}
      </div>
    </main>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-background text-muted"><p className="text-sm">Loading...</p></div>}>
      <AuthForm />
    </Suspense>
  );
}
