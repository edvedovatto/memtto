"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Plus, LogOut, Layers, Heart, Archive, Settings } from "lucide-react";
import { getContexts, getContextSettings } from "@/lib/services/entries";
import { signOut } from "@/lib/services/auth";
import { ContextIcon } from "@/components/context-icon";

export function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [contexts, setContexts] = useState<string[]>([]);
  const [contextIcons, setContextIcons] = useState<Record<string, string>>({});
  const [activeView, setActiveView] = useState<string>("all");
  const [activeContext, setActiveContext] = useState<string>("");

  function loadContexts() {
    getContexts().then(setContexts).catch(console.error);
    getContextSettings().then(setContextIcons).catch(console.error);
  }

  useEffect(() => {
    loadContexts();
  }, []);

  // Refresh contexts when entries change
  useEffect(() => {
    const handler = () => loadContexts();
    window.addEventListener("favoritesChanged", handler);
    window.addEventListener("contextSettingsChanged", handler);
    return () => {
      window.removeEventListener("favoritesChanged", handler);
      window.removeEventListener("contextSettingsChanged", handler);
    };
  }, []);

  // Reset highlight when search is reset
  useEffect(() => {
    const handler = () => {
      setActiveView("all");
      setActiveContext("");
    };
    window.addEventListener("resetSearch", handler);
    return () => window.removeEventListener("resetSearch", handler);
  }, []);

  function handleLogoClick() {
    window.dispatchEvent(new CustomEvent("resetSearch"));
  }

  function handleViewClick(view: string) {
    setActiveView(view);
    setActiveContext("");
    window.dispatchEvent(new CustomEvent("selectView", { detail: view }));
    if (pathname !== "/") router.push("/");
  }

  function handleContextClick(ctx: string) {
    setActiveView("");
    setActiveContext(ctx);
    window.dispatchEvent(new CustomEvent("selectContext", { detail: ctx }));
    if (pathname !== "/") router.push("/");
  }

  async function handleSignOut() {
    await signOut();
    router.push("/login");
    router.refresh();
  }

  const navItemBase =
    "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors";
  const navItemIdle =
    "text-muted-foreground hover:bg-surface-hover hover:text-foreground";
  const navItemActive = "bg-surface-hover text-foreground";

  return (
    <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-64 flex-col border-r border-border bg-surface z-40">
      {/* Logo */}
      <div className="px-5 pt-5 pb-4">
        <Link
          href="/"
          onClick={handleLogoClick}
          className="text-lg font-semibold text-foreground transition-opacity hover:opacity-70"
        >
          memtto
        </Link>
      </div>

      {/* New entry button */}
      <div className="px-3 mb-4">
        <Link
          href="/new"
          className="btn-press flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-3 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent/90"
        >
          <Plus className="h-4 w-4" />
          New entry
        </Link>
      </div>

      {/* Navigation */}
      <nav className="px-3 space-y-0.5">
        <button
          onClick={() => handleViewClick("all")}
          className={`${navItemBase} ${activeView === "all" ? navItemActive : navItemIdle}`}
        >
          <Layers className="h-4 w-4" />
          All
        </button>
        <button
          onClick={() => handleViewClick("favorites")}
          className={`${navItemBase} ${activeView === "favorites" ? navItemActive : navItemIdle}`}
        >
          <Heart className="h-4 w-4" />
          Favorites
        </button>
        <button
          onClick={() => handleViewClick("archived")}
          className={`${navItemBase} ${activeView === "archived" ? navItemActive : navItemIdle}`}
        >
          <Archive className="h-4 w-4" />
          Archived
        </button>
      </nav>

      {/* Contexts */}
      {contexts.length > 0 && (
        <div className="mt-6 flex-1 overflow-y-auto px-3">
          <p className="mb-2 px-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground/50">
            Contexts
          </p>
          <div className="space-y-0.5">
            {contexts.map((ctx) => (
              <button
                key={ctx}
                onClick={() => handleContextClick(ctx)}
                className={`${navItemBase} ${activeContext === ctx ? navItemActive : navItemIdle}`}
              >
                <ContextIcon name={contextIcons[ctx]} className="h-4 w-4" />
                {ctx}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Spacer when no contexts */}
      {contexts.length === 0 && <div className="flex-1" />}

      {/* Bottom */}
      <div className="border-t border-border px-3 py-3 space-y-0.5">
        <Link
          href="/settings"
          className={`${navItemBase} ${pathname === "/settings" ? navItemActive : navItemIdle}`}
        >
          <Settings className="h-4 w-4" />
          Settings
        </Link>
        <button
          onClick={handleSignOut}
          className={`${navItemBase} ${navItemIdle}`}
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
