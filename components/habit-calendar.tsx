"use client";

import type { HabitLog, Habit } from "@/types";

interface HabitCalendarProps {
  logs: HabitLog[];
  habits: Habit[];
  days?: number;
  selectedHabitId?: string | null;
}

const DAY_LABELS = ["", "M", "", "W", "", "F", ""];
const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export function HabitCalendar({
  logs,
  habits,
  days = 60,
  selectedHabitId,
}: HabitCalendarProps) {
  const today = new Date();
  today.setHours(12, 0, 0, 0);

  // Build date range
  const dates: Date[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    dates.push(d);
  }

  // Map: dateString -> Set<habitId>
  const logMap = new Map<string, Set<string>>();
  for (const log of logs) {
    if (selectedHabitId && log.habit_id !== selectedHabitId) continue;
    if (!logMap.has(log.logged_date)) logMap.set(log.logged_date, new Set());
    logMap.get(log.logged_date)!.add(log.habit_id);
  }

  const totalHabits = selectedHabitId
    ? 1
    : habits.filter((h) => !h.is_archived).length;

  // Pad start so first column starts on Monday
  const firstDay = dates[0].getDay(); // 0=Sun
  const padStart = firstDay === 0 ? 6 : firstDay - 1; // Mon=0

  const paddedDates: (Date | null)[] = [
    ...Array(padStart).fill(null),
    ...dates,
  ];

  // Build columns (weeks)
  const columns: (Date | null)[][] = [];
  for (let i = 0; i < paddedDates.length; i += 7) {
    const week = paddedDates.slice(i, i + 7);
    while (week.length < 7) week.push(null);
    columns.push(week);
  }

  // Month labels
  const monthLabels: { col: number; label: string }[] = [];
  let lastMonth = -1;
  for (let c = 0; c < columns.length; c++) {
    const firstDate = columns[c].find((d) => d !== null);
    if (firstDate) {
      const month = firstDate.getMonth();
      if (month !== lastMonth) {
        monthLabels.push({ col: c, label: MONTH_NAMES[month] });
        lastMonth = month;
      }
    }
  }

  function getCellColor(date: Date): string {
    const dateStr = date.toLocaleDateString("en-CA");
    const completedSet = logMap.get(dateStr);
    const completed = completedSet ? completedSet.size : 0;

    if (totalHabits === 0 || completed === 0) return "bg-border/20";
    if (completed >= totalHabits) return "bg-accent";
    return "bg-accent/40";
  }

  function getCellTitle(date: Date): string {
    const dateStr = date.toLocaleDateString("en-CA");
    const completedSet = logMap.get(dateStr);
    const completed = completedSet ? completedSet.size : 0;
    const label = date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    if (selectedHabitId) {
      return `${label}: ${completed ? "Done" : "Missed"}`;
    }
    return `${label}: ${completed}/${totalHabits}`;
  }

  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <div className="flex gap-1">
        {/* Day labels */}
        <div className="flex flex-col gap-[3px] pr-1">
          {DAY_LABELS.map((label, i) => (
            <div
              key={i}
              className="flex h-3 w-4 items-center justify-end text-[10px] leading-none text-muted-foreground/40"
            >
              {label}
            </div>
          ))}
        </div>

        {/* Grid */}
        <div className="overflow-x-auto">
          {/* Month row */}
          <div className="flex gap-[3px] mb-1" style={{ minWidth: columns.length * 15 }}>
            {columns.map((_, c) => {
              const ml = monthLabels.find((m) => m.col === c);
              return (
                <div key={c} className="w-3 text-[10px] leading-none text-muted-foreground/40">
                  {ml?.label || ""}
                </div>
              );
            })}
          </div>

          {/* Cells by row (day of week) */}
          {Array.from({ length: 7 }).map((_, row) => (
            <div key={row} className="flex gap-[3px]">
              {columns.map((week, col) => {
                const date = week[row];
                if (!date) {
                  return <div key={col} className="h-3 w-3" />;
                }
                return (
                  <div
                    key={col}
                    className={`h-3 w-3 rounded-sm ${getCellColor(date)}`}
                    title={getCellTitle(date)}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
