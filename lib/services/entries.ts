import { createClient } from "@/lib/supabase/client";
import type { Entry, CreateEntryInput, UpdateEntryInput, SearchParams, ChecklistItem } from "@/types";

function slugify(text: string): string {
  const charMap: Record<string, string> = {
    á: "a", à: "a", â: "a", ã: "a", ä: "a",
    é: "e", è: "e", ê: "e", ë: "e",
    í: "i", ì: "i", î: "i", ï: "i",
    ó: "o", ò: "o", ô: "o", õ: "o", ö: "o",
    ú: "u", ù: "u", û: "u", ü: "u",
    ç: "c", ñ: "n",
  };
  return text
    .toLowerCase()
    .split("")
    .map((c) => charMap[c] || c)
    .join("")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

export async function createEntry(input: CreateEntryInput): Promise<Entry> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const baseSlug = slugify(input.title);

  // Check for existing slugs to avoid duplicates
  const { data: existing } = await supabase
    .from("entries")
    .select("slug")
    .eq("user_id", user.id)
    .like("slug", `${baseSlug}%`);

  let slug = baseSlug;
  if (existing && existing.length > 0) {
    const taken = new Set(existing.map((e) => e.slug));
    if (taken.has(slug)) {
      let i = 2;
      while (taken.has(`${baseSlug}-${i}`)) i++;
      slug = `${baseSlug}-${i}`;
    }
  }

  const row: Record<string, unknown> = {
    user_id: user.id,
    slug,
    title: input.title,
    content_text: input.content_text,
    content_format: input.content_format || "text",
    context: input.context,
    type: input.type,
    tags: input.tags,
  };

  if (input.image_url) row.image_url = input.image_url;
  if (input.rating != null) row.rating = input.rating;
  if (input.price_cents != null) row.price_cents = input.price_cents;

  const { data, error } = await supabase
    .from("entries")
    .insert(row)
    .select()
    .single();

  if (error) throw error;
  return data as Entry;
}

export async function searchEntries(params: SearchParams): Promise<Entry[]> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  let query = supabase
    .from("entries")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (params.query && params.query.length >= 2) {
    query = query.or(
      `title.ilike.%${params.query}%,content_text.ilike.%${params.query}%,tags.cs.{"${params.query}"}`
    );
  }

  if (params.context) {
    query = query.eq("context", params.context);
  }

  const { data, error } = await query;

  if (error) throw error;
  return (data as Entry[]) ?? [];
}

export async function getEntryBySlug(slug: string): Promise<Entry | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("entries")
    .select("*")
    .eq("slug", slug)
    .eq("user_id", user.id)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }

  return data as Entry;
}

export async function deleteEntry(id: string): Promise<void> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("entries")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) throw error;
}

export async function updateEntry(
  id: string,
  input: UpdateEntryInput
): Promise<Entry> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const row: Record<string, unknown> = {};

  if (input.title !== undefined) row.title = input.title;
  if (input.content_text !== undefined) row.content_text = input.content_text;
  if (input.content_format !== undefined) row.content_format = input.content_format;
  if (input.context !== undefined) row.context = input.context;
  if (input.type !== undefined) row.type = input.type;
  if (input.tags !== undefined) row.tags = input.tags;
  if (input.image_url !== undefined) row.image_url = input.image_url;
  if (input.rating !== undefined) row.rating = input.rating;
  if (input.price_cents !== undefined) row.price_cents = input.price_cents;

  // Recalculate slug if title changed
  if (input.title !== undefined) {
    const baseSlug = slugify(input.title);

    const { data: existing } = await supabase
      .from("entries")
      .select("slug, id")
      .eq("user_id", user.id)
      .like("slug", `${baseSlug}%`);

    let slug = baseSlug;
    if (existing && existing.length > 0) {
      const taken = new Set(
        existing.filter((e) => e.id !== id).map((e) => e.slug)
      );
      if (taken.has(slug)) {
        let i = 2;
        while (taken.has(`${baseSlug}-${i}`)) i++;
        slug = `${baseSlug}-${i}`;
      }
    }
    row.slug = slug;
  }

  const { data, error } = await supabase
    .from("entries")
    .update(row)
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) throw error;
  return data as Entry;
}

export async function toggleChecklistItem(
  id: string,
  itemIndex: number
): Promise<ChecklistItem[]> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const { data: entry, error: fetchError } = await supabase
    .from("entries")
    .select("content_text")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (fetchError) throw fetchError;

  const items: ChecklistItem[] = JSON.parse(entry.content_text);
  items[itemIndex] = { ...items[itemIndex], checked: !items[itemIndex].checked };

  const { error: updateError } = await supabase
    .from("entries")
    .update({ content_text: JSON.stringify(items) })
    .eq("id", id)
    .eq("user_id", user.id);

  if (updateError) throw updateError;

  return items;
}

export async function getContexts(): Promise<string[]> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("entries")
    .select("context")
    .eq("user_id", user.id);

  if (error) throw error;

  const contexts = Array.from(new Set((data ?? []).map((d) => d.context)));
  return contexts.sort();
}
