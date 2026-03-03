"use client";

import { HabitCard } from "@/components/habit-card";
import type { Habit, HabitWithStatus } from "@/types";

interface HabitListProps {
  habits: HabitWithStatus[];
  onToggle: (habitId: string) => void;
  onEdit: (habit: Habit) => void;
  onDelete: (habitId: string) => void;
  onArchive: (habitId: string, archived: boolean) => void;
}

export function HabitList({
  habits,
  onToggle,
  onEdit,
  onDelete,
  onArchive,
}: HabitListProps) {
  return (
    <div className="space-y-2">
      {habits.map((habit, i) => (
        <div
          key={habit.id}
          className="fade-in-up"
          style={{ animationDelay: `${i * 60}ms` }}
        >
          <HabitCard
            habit={habit}
            onToggle={() => onToggle(habit.id)}
            onEdit={() => onEdit(habit)}
            onDelete={() => onDelete(habit.id)}
            onArchive={(archived) => onArchive(habit.id, archived)}
          />
        </div>
      ))}
    </div>
  );
}
