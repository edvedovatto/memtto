"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, LogOut } from "lucide-react";
import { signOut } from "@/lib/services/auth";

export function Header() {
  const router = useRouter();

  async function handleSignOut() {
    await signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="border-b border-border bg-surface">
      <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
        <Link
          href="/"
          onClick={() => window.dispatchEvent(new CustomEvent("resetSearch"))}
          className="text-lg font-semibold text-foreground"
        >
          memtto
        </Link>
        <div className="flex items-center gap-2">
          <Link
            href="/new"
            className="flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-surface-hover hover:text-foreground"
          >
            <Plus className="h-4 w-4" />
            New
          </Link>
          <button
            onClick={handleSignOut}
            className="rounded-lg border border-border p-2 text-muted-foreground transition-colors hover:bg-surface-hover hover:text-foreground"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
