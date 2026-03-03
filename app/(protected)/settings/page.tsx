"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Pencil, Trash2, Download, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { getCurrentUser, updatePassword } from "@/lib/services/auth";
import {
  getContexts,
  getContextSettings,
  setContextIcon as saveContextIcon,
  renameContext,
  deleteContext,
  getAllEntries,
} from "@/lib/services/entries";
import { IconPicker } from "@/components/icon-picker";
import { DEFAULT_CONTEXT_ICON } from "@/lib/context-icons";
import type { Entry } from "@/types";

const inputClass =
  "w-full rounded-lg border border-border bg-secondary px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring";

export default function SettingsPage() {
  // Profile
  const [email, setEmail] = useState("");
  const [createdAt, setCreatedAt] = useState("");

  // Password
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Contexts
  const [contexts, setContexts] = useState<string[]>([]);
  const [contextIcons, setContextIcons] = useState<Record<string, string>>({});
  const [editingCtx, setEditingCtx] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [deletingCtx, setDeletingCtx] = useState<string | null>(null);
  const [ctxLoading, setCtxLoading] = useState<string | null>(null);

  // Export
  const [exportLoading, setExportLoading] = useState(false);

  // Load profile & contexts
  useEffect(() => {
    getCurrentUser()
      .then((user) => {
        setEmail(user.email);
        setCreatedAt(
          new Date(user.createdAt).toLocaleDateString("pt-BR", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })
        );
      })
      .catch(console.error);

    loadContexts();
  }, []);

  function loadContexts() {
    getContexts().then(setContexts).catch(console.error);
    getContextSettings().then(setContextIcons).catch(console.error);
  }

  // ── Password ──────────────────────────────

  async function handleUpdatePassword(e: React.FormEvent) {
    e.preventDefault();

    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setPasswordLoading(true);
    try {
      await updatePassword(newPassword);
      toast.success("Password updated.");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update password."
      );
    } finally {
      setPasswordLoading(false);
    }
  }

  // ── Contexts ──────────────────────────────

  async function handleRename(oldName: string) {
    const trimmed = editValue.trim();
    if (!trimmed || trimmed === oldName) {
      setEditingCtx(null);
      return;
    }

    setCtxLoading(oldName);
    try {
      await renameContext(oldName, trimmed);
      toast.success(`"${oldName}" renamed to "${trimmed}".`);
      loadContexts();
      setEditingCtx(null);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to rename context."
      );
    } finally {
      setCtxLoading(null);
    }
  }

  async function handleDelete(name: string) {
    setCtxLoading(name);
    try {
      await deleteContext(name);
      toast.success(
        `"${name}" deleted. Entries moved to "Uncategorized".`
      );
      loadContexts();
      setDeletingCtx(null);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to delete context."
      );
    } finally {
      setCtxLoading(null);
    }
  }

  async function handleIconChange(ctx: string, icon: string) {
    setContextIcons((prev) => ({ ...prev, [ctx]: icon }));
    try {
      await saveContextIcon(ctx, icon);
      window.dispatchEvent(new CustomEvent("contextSettingsChanged"));
    } catch {
      toast.error("Failed to update icon.");
    }
  }

  // ── Export ────────────────────────────────

  async function handleExport(format: "json" | "csv") {
    setExportLoading(true);
    try {
      const entries = await getAllEntries();

      let content: string;
      let mimeType: string;
      let extension: string;

      if (format === "json") {
        content = JSON.stringify(entries, null, 2);
        mimeType = "application/json";
        extension = "json";
      } else {
        content = entriesToCSV(entries);
        mimeType = "text/csv";
        extension = "csv";
      }

      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `memtto-export-${new Date().toISOString().slice(0, 10)}.${extension}`;
      a.click();
      URL.revokeObjectURL(url);

      toast.success(`Exported ${entries.length} entries as ${format.toUpperCase()}.`);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to export data."
      );
    } finally {
      setExportLoading(false);
    }
  }

  function entriesToCSV(entries: Entry[]): string {
    const headers = [
      "title",
      "context",
      "type",
      "content_text",
      "tags",
      "rating",
      "price_cents",
      "is_favorite",
      "is_archived",
      "created_at",
    ];
    const escape = (v: string) =>
      `"${String(v ?? "").replace(/"/g, '""')}"`;

    const rows = entries.map((e) =>
      [
        escape(e.title),
        escape(e.context),
        escape(e.type),
        escape(e.content_text),
        escape((e.tags ?? []).join(", ")),
        e.rating ?? "",
        e.price_cents ?? "",
        e.is_favorite ? "yes" : "no",
        e.is_archived ? "yes" : "no",
        e.created_at,
      ].join(",")
    );

    return [headers.join(","), ...rows].join("\n");
  }

  // ── Card wrapper ──────────────────────────

  function Card({
    title,
    children,
  }: {
    title: string;
    children: React.ReactNode;
  }) {
    return (
      <section className="rounded-xl border border-border bg-surface p-6">
        <h2 className="mb-4 text-sm font-semibold text-foreground">{title}</h2>
        {children}
      </section>
    );
  }

  // ── Render ────────────────────────────────

  return (
    <div className="fade-in-up">
      {/* Header */}
      <div className="mb-8 flex items-center gap-3">
        <Link
          href="/"
          className="btn-press rounded-lg border border-border p-2 text-muted-foreground transition-colors hover:bg-surface-hover hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h1 className="text-lg font-semibold text-foreground">Settings</h1>
      </div>

      <div className="space-y-6">
        {/* ─── Profile ─── */}
        <Card title="Profile">
          <div className="space-y-3">
            <div>
              <p className="text-xs text-muted-foreground/60">Email</p>
              <p className="text-sm text-foreground">{email || "..."}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground/60">Member since</p>
              <p className="text-sm text-foreground">{createdAt || "..."}</p>
            </div>
          </div>
        </Card>

        {/* ─── Password ─── */}
        <Card title="Change password">
          <form onSubmit={handleUpdatePassword} className="space-y-3">
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="New password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={inputClass}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={inputClass}
            />
            <button
              type="submit"
              disabled={passwordLoading || !newPassword || !confirmPassword}
              className="btn-press rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent/90 disabled:opacity-40"
            >
              {passwordLoading ? "Updating..." : "Update password"}
            </button>
          </form>
        </Card>

        {/* ─── Contexts ─── */}
        <Card title="Contexts">
          {contexts.length === 0 ? (
            <p className="text-sm text-muted-foreground/60">
              No contexts yet. Create one when adding a new entry.
            </p>
          ) : (
            <div className="space-y-2">
              {contexts.map((ctx) => (
                <div
                  key={ctx}
                  className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2"
                >
                  <IconPicker
                    value={contextIcons[ctx] || DEFAULT_CONTEXT_ICON}
                    onChange={(icon) => handleIconChange(ctx, icon)}
                  />

                  {editingCtx === ctx ? (
                    <input
                      autoFocus
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleRename(ctx);
                        if (e.key === "Escape") setEditingCtx(null);
                      }}
                      onBlur={() => handleRename(ctx)}
                      className="flex-1 bg-transparent text-sm text-foreground outline-none"
                    />
                  ) : (
                    <span className="flex-1 text-sm text-foreground">{ctx}</span>
                  )}

                  {deletingCtx === ctx ? (
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-muted-foreground">Sure?</span>
                      <button
                        onClick={() => handleDelete(ctx)}
                        disabled={ctxLoading === ctx}
                        className="rounded px-2 py-1 text-xs font-medium text-destructive hover:bg-destructive/10"
                      >
                        {ctxLoading === ctx ? "..." : "Yes"}
                      </button>
                      <button
                        onClick={() => setDeletingCtx(null)}
                        className="rounded px-2 py-1 text-xs text-muted-foreground hover:text-foreground"
                      >
                        No
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setEditingCtx(ctx);
                          setEditValue(ctx);
                        }}
                        disabled={ctxLoading === ctx}
                        className="btn-press rounded p-1.5 text-muted-foreground transition-colors hover:bg-surface-hover hover:text-foreground"
                        title="Rename"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => setDeletingCtx(ctx)}
                        disabled={ctxLoading === ctx}
                        className="btn-press rounded p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                        title="Delete"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* ─── Export ─── */}
        <Card title="Export data">
          <p className="mb-4 text-xs text-muted-foreground/60">
            Download all your entries.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => handleExport("json")}
              disabled={exportLoading}
              className="btn-press flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-surface-hover hover:text-foreground disabled:opacity-40"
            >
              <Download className="h-4 w-4" />
              JSON
            </button>
            <button
              onClick={() => handleExport("csv")}
              disabled={exportLoading}
              className="btn-press flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-surface-hover hover:text-foreground disabled:opacity-40"
            >
              <Download className="h-4 w-4" />
              CSV
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}
