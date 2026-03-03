export interface ChecklistItem {
  text: string;
  checked: boolean;
}

export interface Entry {
  id: string;
  user_id: string;
  slug: string;
  context: string;
  type: string;
  title: string;
  content_text: string;
  content_format: "text" | "checklist";
  tags: string[];
  image_url: string | null;
  rating: number | null;
  price_cents: number | null;
  is_favorite: boolean;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateEntryInput {
  context: string;
  type: string;
  title: string;
  content_text: string;
  content_format?: "text" | "checklist";
  tags: string[];
  image_url?: string | null;
  rating?: number | null;
  price_cents?: number | null;
}

export type UpdateEntryInput = Partial<CreateEntryInput> & {
  is_favorite?: boolean;
};

export const ENTRY_TYPES = ["note", "idea", "snippet", "experience"] as const;
export type EntryType = (typeof ENTRY_TYPES)[number];

export type SortField = "created_at" | "title" | "rating" | "price_cents";
export type SortOrder = "asc" | "desc";

export const SORT_OPTIONS = [
  { label: "Newest", field: "created_at" as SortField, order: "desc" as SortOrder },
  { label: "Oldest", field: "created_at" as SortField, order: "asc" as SortOrder },
  { label: "Title (A-Z)", field: "title" as SortField, order: "asc" as SortOrder },
  { label: "Rating", field: "rating" as SortField, order: "desc" as SortOrder },
  { label: "Price", field: "price_cents" as SortField, order: "desc" as SortOrder },
] as const;

export interface SearchParams {
  query?: string;
  context?: string;
  type?: EntryType;
  sortBy?: SortField;
  sortOrder?: SortOrder;
}

export interface DashboardStats {
  totalEntries: number;
  totalFavorites: number;
  totalContexts: number;
  entriesThisWeek: number;
}

export interface ContextCount {
  context: string;
  count: number;
}

export interface TagCount {
  tag: string;
  count: number;
}

// ── Habits ────────────────────────────────

export interface Habit {
  id: string;
  user_id: string;
  name: string;
  icon: string;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface HabitLog {
  id: string;
  habit_id: string;
  user_id: string;
  logged_date: string;
  created_at: string;
}

export interface CreateHabitInput {
  name: string;
  icon?: string;
}

export interface UpdateHabitInput {
  name?: string;
  icon?: string;
}

export interface HabitWithStatus extends Habit {
  completedToday: boolean;
  currentStreak: number;
}
