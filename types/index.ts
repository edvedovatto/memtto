export interface Entry {
  id: string;
  user_id: string;
  context: string;
  type: string;
  title: string;
  content_text: string;
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
  tags: string[];
  image_url?: string | null;
  rating?: number | null;
  price_cents?: number | null;
}

export interface SearchParams {
  query?: string;
  context?: string;
}
