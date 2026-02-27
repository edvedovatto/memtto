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
            className="flex items-center gap-1 rounded-lg bg-foreground px-3 py-1.5 text-xs font-medium text-background transition-opacity hover:opacity-90"
          >
            <Plus className="h-3.5 w-3.5" />
            New
          </Link>
          <button
            onClick={handleSignOut}
            className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:text-foreground"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
