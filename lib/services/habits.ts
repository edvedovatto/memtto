import { createClient } from "@/lib/supabase/client";
import type {
  Habit,
  HabitLog,
  CreateHabitInput,
  UpdateHabitInput,
  HabitWithStatus,
} from "@/types";

function getLocalDateString(): string {
  return new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD in local tz
}

export async function createHabit(input: CreateHabitInput): Promise<Habit> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const row: Record<string, unknown> = {
    user_id: user.id,
    name: input.name.trim(),
  };
  if (input.icon) row.icon = input.icon;

  const { data, error } = await supabase
    .from("habits")
    .insert(row)
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      throw new Error("A habit with this name already exists.");
    }
    throw error;
  }
  return data as Habit;
}

export async function getHabits(includeArchived = false): Promise<Habit[]> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  let query = supabase
    .from("habits")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  if (!includeArchived) {
    query = query.eq("is_archived", false);
  }

  const { data, error } = await query;

  if (error) throw error;
  return (data as Habit[]) ?? [];
}

export async function updateHabit(
  id: string,
  input: UpdateHabitInput
): Promise<Habit> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const row: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (input.name !== undefined) row.name = input.name.trim();
  if (input.icon !== undefined) row.icon = input.icon;

  const { data, error } = await supabase
    .from("habits")
    .update(row)
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      throw new Error("A habit with this name already exists.");
    }
    throw error;
  }
  return data as Habit;
}

export async function deleteHabit(id: string): Promise<void> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("habits")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) throw error;
}

export async function toggleArchiveHabit(
  id: string,
  isArchived: boolean
): Promise<void> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("habits")
    .update({ is_archived: isArchived, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) throw error;
}

export async function toggleLog(
  habitId: string,
  date?: string
): Promise<boolean> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const logDate = date || getLocalDateString();

  // Check if log exists
  const { data: existing } = await supabase
    .from("habit_logs")
    .select("id")
    .eq("habit_id", habitId)
    .eq("logged_date", logDate)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("habit_logs")
      .delete()
      .eq("id", existing.id);
    if (error) throw error;
    return false;
  } else {
    const { error } = await supabase
      .from("habit_logs")
      .insert({ habit_id: habitId, user_id: user.id, logged_date: logDate });
    if (error) throw error;
    return true;
  }
}

export async function getLogsForRange(
  habitIds: string[],
  startDate: string,
  endDate: string
): Promise<HabitLog[]> {
  if (habitIds.length === 0) return [];

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("habit_logs")
    .select("*")
    .eq("user_id", user.id)
    .in("habit_id", habitIds)
    .gte("logged_date", startDate)
    .lte("logged_date", endDate)
    .order("logged_date", { ascending: true });

  if (error) throw error;
  return (data as HabitLog[]) ?? [];
}

function computeStreak(logs: HabitLog[], today: string): number {
  const dates = new Set(logs.map((l) => l.logged_date));
  let streak = 0;
  const d = new Date(today + "T12:00:00"); // noon to avoid DST issues

  // If today is not logged, start checking from yesterday
  if (!dates.has(today)) {
    d.setDate(d.getDate() - 1);
  }

  while (true) {
    const dateStr = d.toLocaleDateString("en-CA");
    if (dates.has(dateStr)) {
      streak++;
      d.setDate(d.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

export async function getHabitsWithStatus(): Promise<HabitWithStatus[]> {
  const habits = await getHabits();
  if (habits.length === 0) return [];

  const today = getLocalDateString();
  const start = new Date(today + "T12:00:00");
  start.setDate(start.getDate() - 90);
  const startDate = start.toLocaleDateString("en-CA");

  const logs = await getLogsForRange(
    habits.map((h) => h.id),
    startDate,
    today
  );

  // Group logs by habit_id
  const logsByHabit: Record<string, HabitLog[]> = {};
  for (const log of logs) {
    if (!logsByHabit[log.habit_id]) logsByHabit[log.habit_id] = [];
    logsByHabit[log.habit_id].push(log);
  }

  return habits.map((habit) => {
    const habitLogs = logsByHabit[habit.id] || [];
    const completedToday = habitLogs.some((l) => l.logged_date === today);
    const currentStreak = computeStreak(habitLogs, today);

    return { ...habit, completedToday, currentStreak };
  });
}
