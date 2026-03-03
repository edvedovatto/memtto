"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, ChevronDown, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import {
  getHabitsWithStatus,
  getHabits,
  getLogsForRange,
  createHabit,
  updateHabit,
  deleteHabit,
  toggleArchiveHabit,
  toggleLog,
} from "@/lib/services/habits";
import { HabitList } from "@/components/habit-list";
import { HabitCalendar } from "@/components/habit-calendar";
import { AddHabitDialog } from "@/components/add-habit-dialog";
import type { Habit, HabitWithStatus, HabitLog, CreateHabitInput } from "@/types";

function getLocalDateString(): string {
  return new Date().toLocaleDateString("en-CA");
}

export default function HabitsPage() {
  const [habits, setHabits] = useState<HabitWithStatus[]>([]);
  const [archivedHabits, setArchivedHabits] = useState<HabitWithStatus[]>([]);
  const [allHabits, setAllHabits] = useState<Habit[]>([]);
  const [logs, setLogs] = useState<HabitLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [showArchived, setShowArchived] = useState(false);

  const today = getLocalDateString();
  const todayFormatted = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const loadData = useCallback(async () => {
    try {
      const [statusHabits, all, archivedList] = await Promise.all([
        getHabitsWithStatus(),
        getHabits(true),
        getHabits(true).then((h) => h.filter((x) => x.is_archived)),
      ]);

      setHabits(statusHabits);
      setAllHabits(all);

      // Build archived with status
      const archivedWithStatus: HabitWithStatus[] = archivedList.map((h) => ({
        ...h,
        completedToday: false,
        currentStreak: 0,
      }));
      setArchivedHabits(archivedWithStatus);

      // Fetch logs for calendar (60 days)
      if (all.length > 0) {
        const start = new Date(today + "T12:00:00");
        start.setDate(start.getDate() - 60);
        const startDate = start.toLocaleDateString("en-CA");
        const calLogs = await getLogsForRange(
          all.map((h) => h.id),
          startDate,
          today
        );
        setLogs(calLogs);
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to load habits."
      );
    } finally {
      setLoading(false);
    }
  }, [today]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function handleToggle(habitId: string) {
    // Optimistic update
    setHabits((prev) =>
      prev.map((h) =>
        h.id === habitId
          ? {
              ...h,
              completedToday: !h.completedToday,
              currentStreak: !h.completedToday
                ? h.currentStreak + 1
                : Math.max(0, h.currentStreak - 1),
            }
          : h
      )
    );

    try {
      await toggleLog(habitId);
      await loadData();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to toggle habit."
      );
      await loadData();
    }
  }

  async function handleSave(input: CreateHabitInput) {
    try {
      if (editingHabit) {
        await updateHabit(editingHabit.id, input);
        toast.success("Habit updated.");
      } else {
        await createHabit(input);
        toast.success("Habit created.");
      }
      setEditingHabit(null);
      await loadData();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to save habit."
      );
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteHabit(id);
      toast.success("Habit deleted.");
      await loadData();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to delete habit."
      );
    }
  }

  async function handleArchive(id: string, archived: boolean) {
    try {
      await toggleArchiveHabit(id, archived);
      toast.success(archived ? "Habit archived." : "Habit restored.");
      await loadData();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to archive habit."
      );
    }
  }

  function handleEdit(habit: Habit) {
    setEditingHabit(habit);
    setShowDialog(true);
  }

  // Completion stats
  const completedCount = habits.filter((h) => h.completedToday).length;
  const totalActive = habits.length;

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
        <h1 className="flex-1 text-lg font-semibold text-foreground">Habits</h1>
        <button
          onClick={() => {
            setEditingHabit(null);
            setShowDialog(true);
          }}
          className="btn-press flex items-center gap-1.5 rounded-lg bg-accent px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-accent/90"
        >
          <Plus className="h-4 w-4" />
          Add habit
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-16 animate-pulse rounded-xl border border-border bg-surface"
            />
          ))}
        </div>
      ) : habits.length === 0 && archivedHabits.length === 0 ? (
        /* Empty state */
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-3 text-4xl">🎯</div>
          <p className="text-sm font-medium text-foreground">No habits yet</p>
          <p className="mt-1 text-xs text-muted-foreground/60">
            Add your first habit to start tracking.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Today section */}
          {habits.length > 0 && (
            <div>
              <div className="mb-3 flex items-baseline justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-foreground">Today</h2>
                  <p className="text-xs text-muted-foreground/60">
                    {todayFormatted}
                  </p>
                </div>
                {totalActive > 0 && (
                  <p className="text-xs text-muted-foreground/60">
                    {completedCount}/{totalActive} done
                  </p>
                )}
              </div>

              {/* Progress bar */}
              {totalActive > 0 && (
                <div className="mb-4 h-1.5 overflow-hidden rounded-full bg-border/30">
                  <div
                    className="h-full rounded-full bg-accent transition-all duration-500"
                    style={{
                      width: `${(completedCount / totalActive) * 100}%`,
                    }}
                  />
                </div>
              )}

              <HabitList
                habits={habits}
                onToggle={handleToggle}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onArchive={handleArchive}
              />
            </div>
          )}

          {/* Calendar */}
          {allHabits.length > 0 && (
            <div>
              <h2 className="mb-3 text-sm font-semibold text-foreground">
                History
              </h2>
              <HabitCalendar
                logs={logs}
                habits={allHabits}
                days={60}
              />
            </div>
          )}

          {/* Archived */}
          {archivedHabits.length > 0 && (
            <div>
              <button
                onClick={() => setShowArchived(!showArchived)}
                className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
              >
                {showArchived ? (
                  <ChevronDown className="h-3.5 w-3.5" />
                ) : (
                  <ChevronRight className="h-3.5 w-3.5" />
                )}
                Archived ({archivedHabits.length})
              </button>
              {showArchived && (
                <HabitList
                  habits={archivedHabits}
                  onToggle={() => {}}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onArchive={handleArchive}
                />
              )}
            </div>
          )}
        </div>
      )}

      {/* Dialog */}
      <AddHabitDialog
        open={showDialog}
        onClose={() => {
          setShowDialog(false);
          setEditingHabit(null);
        }}
        onSave={handleSave}
        editingHabit={editingHabit}
      />
    </div>
  );
}
