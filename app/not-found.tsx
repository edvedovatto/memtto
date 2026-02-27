import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <h1 className="text-5xl font-bold text-foreground">404</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        Page not found.
      </p>
      <Link
        href="/"
        className="mt-6 rounded-lg bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-90"
      >
        Go home
      </Link>
    </div>
  );
}
