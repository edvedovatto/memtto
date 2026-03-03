"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { IconPicker } from "@/components/icon-picker";
import type { Habit, CreateHabitInput } from "@/types";

interface AddHabitDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (input: CreateHabitInput) => void;
  editingHabit?: Habit | null;
}

export function AddHabitDialog({
  open,
  onClose,
  onSave,
  editingHabit,
}: AddHabitDialogProps) {
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("Target");
  const [closing, setClosing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setName(editingHabit?.name || "");
      setIcon(editingHabit?.icon || "Target");
      setClosing(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open, editingHabit]);

  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") handleClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open]);

  function handleClose() {
    setClosing(true);
    setTimeout(() => {
      onClose();
      setClosing(false);
    }, 200);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    onSave({ name: trimmed, icon });
    handleClose();
  }

  if (!open) return null;

  return createPortal(
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm ${closing ? "animate-fade-out" : "animate-fade-in"}`}
      onMouseDown={handleClose}
    >
      <div
        className={`mx-4 w-full max-w-sm rounded-2xl border border-border bg-surface p-6 shadow-2xl ${closing ? "animate-scale-out" : "animate-scale-in"}`}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">
            {editingHabit ? "Edit habit" : "Add habit"}
          </h2>
          <button
            onClick={handleClose}
            className="rounded-lg p-1 text-muted-foreground transition-colors hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name + Icon */}
          <div className="flex items-center gap-2">
            <IconPicker value={icon} onChange={setIcon} />
            <input
              ref={inputRef}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Habit name"
              maxLength={60}
              className="flex-1 rounded-lg border border-border bg-secondary px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={handleClose}
              className="rounded-lg px-4 py-2.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="btn-press rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent/90 disabled:opacity-40"
            >
              {editingHabit ? "Save" : "Add"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
