import { createClient } from "@/lib/supabase/client";
import type { Entry, CreateEntryInput, SearchParams } from "@/types";

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
