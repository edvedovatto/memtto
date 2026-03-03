"use client";

import { useState } from "react";
import { Check, MoreHorizontal, Pencil, Archive, ArchiveRestore, Trash2 } from "lucide-react";
import { getIcon } from "@/lib/context-icons";
import type { HabitWithStatus } from "@/types";

interface HabitCardProps {
  habit: HabitWithStatus;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onArchive: (archived: boolean) => void;
}

export function HabitCard({
  habit,
  onToggle,
  onEdit,
  onDelete,
  onArchive,
}: HabitCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const Icon = getIcon(habit.icon);

  return (
    <div className="group flex items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3 transition-colors hover:bg-surface-hover/50">
      {/* Icon */}
      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-secondary">
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>

      {/* Name + streak */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">
          {habit.name}
        </p>
        {habit.currentStreak > 0 && (
          <p className="text-xs text-muted-foreground/60">
            {habit.currentStreak >= 7 && "🔥 "}
            {habit.currentStreak} day{habit.currentStreak !== 1 ? "s" : ""} streak
          </p>
        )}
      </div>

      {/* Menu */}
      <div className="relative">
        <button
          onClick={() => {
            setMenuOpen(!menuOpen);
            setConfirmDelete(false);
          }}
          className="btn-press rounded-lg p-1.5 text-muted-foreground/40 transition-colors hover:bg-surface-hover hover:text-foreground opacity-0 group-hover:opacity-100 focus:opacity-100"
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>

        {menuOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
            <div className="absolute right-0 top-full z-50 mt-1 w-40 rounded-lg border border-border bg-surface py-1 shadow-xl">
              <button
                onClick={() => {
                  setMenuOpen(false);
                  onEdit();
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:bg-surface-hover hover:text-foreground"
              >
                <Pencil className="h-3.5 w-3.5" />
                Edit
              </button>
              <button
                onClick={() => {
                  setMenuOpen(false);
                  onArchive(!habit.is_archived);
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:bg-surface-hover hover:text-foreground"
              >
                {habit.is_archived ? (
                  <ArchiveRestore className="h-3.5 w-3.5" />
                ) : (
                  <Archive className="h-3.5 w-3.5" />
                )}
                {habit.is_archived ? "Unarchive" : "Archive"}
              </button>
              {confirmDelete ? (
                <div className="flex items-center gap-1 px-3 py-2">
                  <span className="text-xs text-muted-foreground">Sure?</span>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      setConfirmDelete(false);
                      onDelete();
                    }}
                    className="rounded px-2 py-0.5 text-xs font-medium text-destructive hover:bg-destructive/10"
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => setConfirmDelete(false)}
                    className="rounded px-2 py-0.5 text-xs text-muted-foreground hover:text-foreground"
                  >
                    No
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </button>
              )}
            </div>
          </>
        )}
      </div>

      {/* Checkbox */}
      <button
        onClick={onToggle}
        className={`btn-press flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border-2 transition-all ${
          habit.completedToday
            ? "border-accent bg-accent text-white"
            : "border-border text-transparent hover:border-accent/50"
        }`}
      >
        <Check className="h-4 w-4" strokeWidth={3} />
      </button>
    </div>
  );
}
