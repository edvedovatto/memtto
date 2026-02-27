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

export interface SearchParams {
  query?: string;
  context?: string;
}
