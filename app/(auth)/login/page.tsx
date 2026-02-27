"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn, signUp } from "@/lib/services/auth";

function getFriendlyError(message: string, isSignUp: boolean): string {
  const msg = message.toLowerCase();

  if (isSignUp) {
    if (msg.includes("already registered") || msg.includes("already been registered"))
      return "This email is already registered.";
    if (msg.includes("password") && (msg.includes("short") || msg.includes("least")))
      return "Password must be at least 6 characters.";
    if (msg.includes("valid email") || msg.includes("invalid email"))
      return "Please enter a valid email address.";
    if (msg.includes("rate limit"))
      return "Too many attempts. Please wait a few minutes and try again.";
    return "Unable to create account. Please try again.";
  }

  if (msg.includes("invalid login") || msg.includes("invalid credentials"))
    return "Incorrect email or password.";
  if (msg.includes("email not confirmed"))
    return "Please confirm your email before signing in.";
  if (msg.includes("user not found"))
    return "No account found with this email.";
  return "Unable to sign in. Please try again.";
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirmEmail, setConfirmEmail] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (isSignUp && password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      if (isSignUp) {
        await signUp(email, password);
        // TODO: restore setConfirmEmail(true) when email confirmation is enabled
      } else {
        await signIn(email, password);
      }
      router.push("/");
      router.refresh();
    } catch (err) {
      const raw = err instanceof Error ? err.message : "Unknown error";
      setError(getFriendlyError(raw, isSignUp));
    } finally {
      setLoading(false);
    }
  }

  if (confirmEmail) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-sm text-center">
          <h1 className="mb-8 text-2xl font-semibold text-foreground">
            memtto
          </h1>

          <div className="rounded-lg border border-border bg-surface px-6 py-8">
            <p className="text-sm font-medium text-foreground">
              Check your email
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              We sent a confirmation link to{" "}
              <span className="font-medium text-foreground">{email}</span>.
              <br />
              Click the link to activate your account.
            </p>
          </div>

          <button
            onClick={() => {
              setConfirmEmail(false);
              setIsSignUp(false);
              setError("");
            }}
            className="mt-4 w-full rounded-lg border border-border py-3 text-center text-sm text-muted-foreground transition-colors hover:bg-surface-hover hover:text-foreground"
          >
            Back to sign in
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="mb-8 text-center text-2xl font-semibold text-foreground">
          memtto
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
              className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none ring-0 focus:outline-none focus:ring-0 focus:border-border"
            />
          </div>
          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              minLength={6}
              className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none ring-0 focus:outline-none focus:ring-0 focus:border-border"
            />
          </div>

          {error && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-2.5">
              <p className="text-xs text-destructive">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-foreground py-3 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {loading
              ? "Loading..."
              : isSignUp
              ? "Create account"
              : "Sign in"}
          </button>
        </form>

        <button
          onClick={() => {
            setIsSignUp(!isSignUp);
            setError("");
          }}
          className="mt-4 w-full rounded-lg border border-border py-3 text-center text-sm text-muted-foreground transition-colors hover:bg-surface-hover hover:text-foreground"
        >
          {isSignUp
            ? "Already have an account? Sign in"
            : "Don't have an account? Create one"}
        </button>
      </div>
    </div>
  );
}
