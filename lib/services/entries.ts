import { createClient } from "@/lib/supabase/client";
import type { Entry, CreateEntryInput, UpdateEntryInput, SearchParams, ChecklistItem, DashboardStats, ContextCount, TagCount } from "@/types";

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

  const sortField = params.sortBy || "created_at";
  const ascending = params.sortOrder === "asc";

  let query = supabase
    .from("entries")
    .select("*")
    .eq("user_id", user.id)
    .order(sortField, { ascending, nullsFirst: false });

  if (params.query && params.query.length >= 2) {
    const trimmed = params.query.trim();
    if (trimmed.startsWith("#") && trimmed.length >= 2) {
      const tagName = trimmed.slice(1);
      query = query.contains("tags", [tagName]);
    } else if (trimmed.length >= 3) {
      // Full-text search via tsvector (websearch handles multi-word + quotes)
      query = query.textSearch("search_vector", trimmed, {
        type: "websearch",
        config: "english",
      });
    } else {
      // Short queries (2 chars): fallback to ilike
      query = query.or(
        `title.ilike.%${trimmed}%,content_text.ilike.%${trimmed}%,tags.cs.{"${trimmed}"}`
      );
    }
  }

  if (params.context) {
    query = query.eq("context", params.context);
  }

  if (params.type) {
    query = query.eq("type", params.type);
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

export async function toggleFavorite(
  id: string,
  isFavorite: boolean
): Promise<void> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("entries")
    .update({ is_favorite: isFavorite })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) throw error;
}

export async function toggleArchive(
  id: string,
  isArchived: boolean
): Promise<void> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("entries")
    .update({ is_archived: isArchived })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) throw error;
}

export async function getFavorites(): Promise<Entry[]> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("entries")
    .select("*")
    .eq("user_id", user.id)
    .eq("is_favorite", true)
    .order("updated_at", { ascending: false });

  if (error) throw error;
  return (data as Entry[]) ?? [];
}

export async function getArchivedEntries(): Promise<Entry[]> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("entries")
    .select("*")
    .eq("user_id", user.id)
    .eq("is_archived", true)
    .order("updated_at", { ascending: false });

  if (error) throw error;
  return (data as Entry[]) ?? [];
}

export async function getAllEntries(): Promise<Entry[]> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("entries")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data as Entry[]) ?? [];
}

export async function renameContext(
  oldName: string,
  newName: string
): Promise<void> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("entries")
    .update({ context: newName })
    .eq("user_id", user.id)
    .eq("context", oldName);

  if (error) throw error;

  // Rename in context_settings too
  await supabase
    .from("context_settings")
    .update({ name: newName })
    .eq("user_id", user.id)
    .eq("name", oldName);
}

export async function deleteContext(name: string): Promise<void> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("entries")
    .update({ context: "Uncategorized" })
    .eq("user_id", user.id)
    .eq("context", name);

  if (error) throw error;

  // Remove from context_settings
  await supabase
    .from("context_settings")
    .delete()
    .eq("user_id", user.id)
    .eq("name", name);
}

export async function getContextSettings(): Promise<Record<string, string>> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("context_settings")
    .select("name, icon")
    .eq("user_id", user.id);

  if (error) throw error;

  const map: Record<string, string> = {};
  for (const row of data ?? []) {
    map[row.name] = row.icon;
  }
  return map;
}

export async function setContextIcon(
  name: string,
  icon: string
): Promise<void> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("context_settings")
    .upsert(
      { user_id: user.id, name, icon },
      { onConflict: "user_id,name" }
    );

  if (error) throw error;
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

export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  const [totalRes, favRes, weekRes] = await Promise.all([
    supabase
      .from("entries")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id),
    supabase
      .from("entries")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("is_favorite", true),
    supabase
      .from("entries")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gte("created_at", weekAgo.toISOString()),
  ]);

  return {
    totalEntries: totalRes.count ?? 0,
    totalFavorites: favRes.count ?? 0,
    totalContexts: 0, // filled by caller from contexts.length
    entriesThisWeek: weekRes.count ?? 0,
  };
}

export async function getRecentEntries(limit: number = 5): Promise<Entry[]> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("entries")
    .select("*")
    .eq("user_id", user.id)
    .eq("is_archived", false)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data as Entry[]) ?? [];
}

export async function getContextCounts(): Promise<ContextCount[]> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("entries")
    .select("context")
    .eq("user_id", user.id)
    .eq("is_archived", false);

  if (error) throw error;

  const counts: Record<string, number> = {};
  for (const row of data ?? []) {
    counts[row.context] = (counts[row.context] || 0) + 1;
  }

  return Object.entries(counts)
    .map(([context, count]) => ({ context, count }))
    .sort((a, b) => b.count - a.count);
}

export async function getTopTags(limit: number = 8): Promise<TagCount[]> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("entries")
    .select("tags")
    .eq("user_id", user.id)
    .eq("is_archived", false);

  if (error) throw error;

  const counts: Record<string, number> = {};
  for (const row of data ?? []) {
    for (const tag of row.tags ?? []) {
      counts[tag] = (counts[tag] || 0) + 1;
    }
  }

  return Object.entries(counts)
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

