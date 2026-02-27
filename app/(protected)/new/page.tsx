"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ImagePlus, X, Star, ChevronDown, AlignLeft, ListChecks, Plus } from "lucide-react";
import Link from "next/link";
import { createEntry, getContexts } from "@/lib/services/entries";
import { uploadImage } from "@/lib/services/storage";
import { toast } from "sonner";

const TITLE_MAX = 120;
const CONTENT_MAX = 2000;
const CONTEXT_MAX = 30;

function formatPrice(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return "";
  const cents = parseInt(digits, 10);
  const reais = (cents / 100).toFixed(2);
  const [intPart, decPart] = reais.split(".");
  const withThousands = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${withThousands},${decPart}`;
}

export default function NewEntryPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [contentText, setContentText] = useState("");
  const [context, setContext] = useState("");
  const [type, setType] = useState("note");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [rating, setRating] = useState<number | null>(null);
  const [priceRaw, setPriceRaw] = useState("");
  const [contentFormat, setContentFormat] = useState<"text" | "checklist">("text");
  const [checklistItems, setChecklistItems] = useState<string[]>([]);
  const [checklistInput, setChecklistInput] = useState("");

  // Context creatable select
  const [contexts, setContexts] = useState<string[]>([]);
  const [contextOpen, setContextOpen] = useState(false);
  const contextRef = useRef<HTMLDivElement>(null);
  const contextInputRef = useRef<HTMLInputElement>(null);
  const tagInputRef = useRef<HTMLInputElement>(null);
  const checklistInputRef = useRef<HTMLInputElement>(null);
  const typeRef = useRef<HTMLDivElement>(null);
  const [typeOpen, setTypeOpen] = useState(false);

  useEffect(() => {
    getContexts().then(setContexts).catch(console.error);
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (contextRef.current && !contextRef.current.contains(e.target as Node)) {
        setContextOpen(false);
      }
      if (typeRef.current && !typeRef.current.contains(e.target as Node)) {
        setTypeOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  function removeImage() {
    setImageFile(null);
    setImagePreview(null);
  }

  function handleTagKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
    if (e.key === "Backspace" && tagInput === "#" && tags.length > 0) {
      setTags(tags.slice(0, -1));
      setTagInput("");
    }
  }

  function addTag() {
    const value = tagInput.replace(/^#/, "").trim();
    if (value && !tags.includes(value)) {
      setTags([...tags, value]);
    }
    setTagInput("#");
    setTimeout(() => tagInputRef.current?.focus(), 0);
  }

  function removeTag(tag: string) {
    setTags(tags.filter((t) => t !== tag));
  }

  function handleTagFocus() {
    if (!tagInput) setTagInput("#");
  }

  function handleTagBlur() {
    const value = tagInput.replace(/^#/, "").trim();
    if (value && !tags.includes(value)) {
      setTags((prev) => [...prev, value]);
    }
    setTagInput("");
  }

  function selectContext(value: string) {
    setContext(value);
    setContextOpen(false);
    contextInputRef.current?.blur();
    // Add to local list if new
    if (!contexts.some((c) => c.toLowerCase() === value.toLowerCase())) {
      setContexts((prev) => [...prev, value].sort());
    }
  }

  function addChecklistItem() {
    const value = checklistInput.trim();
    if (value) {
      setChecklistItems([...checklistItems, value]);
      setChecklistInput("");
    }
    setTimeout(() => checklistInputRef.current?.focus(), 0);
  }

  function removeChecklistItem(index: number) {
    setChecklistItems(checklistItems.filter((_, i) => i !== index));
  }

  function handleChecklistKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      e.stopPropagation();
      addChecklistItem();
    }
  }

  function handlePriceChange(value: string) {
    const digits = value.replace(/\D/g, "").slice(0, 7);
    setPriceRaw(digits);
  }

  function parsePriceToCents(): number | null {
    if (!priceRaw) return null;
    return parseInt(priceRaw, 10) || null;
  }

  const hasContent = contentFormat === "text" ? contentText.trim() : checklistItems.length > 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !context.trim() || !hasContent) return;

    setLoading(true);
    setError("");

    try {
      let imageUrl: string | null = null;

      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }

      const priceCents = parsePriceToCents();

      const finalContent =
        contentFormat === "checklist"
          ? JSON.stringify(checklistItems.map((text) => ({ text, checked: false })))
          : contentText.trim();

      await createEntry({
        title: title.trim(),
        content_text: finalContent,
        content_format: contentFormat,
        context: context.trim(),
        type,
        tags,
        image_url: imageUrl,
        rating,
        price_cents: priceCents,
      });

      toast.success("Entry created successfully");
      router.push("/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create entry");
    } finally {
      setLoading(false);
    }
  }

  const filteredContexts = contexts.filter((c) =>
    c.toLowerCase().includes(context.toLowerCase())
  );
  const showCreateOption =
    context.trim() !== "" &&
    !contexts.some((c) => c.toLowerCase() === context.trim().toLowerCase());

  const inputClass =
    "w-full rounded-lg border border-border bg-secondary px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring";

  return (
    <form onSubmit={handleSubmit} className="space-y-4 fade-in-up">
      {/* Header with back */}
      <div className="space-y-2">
        <Link
          href="/"
          className="btn-press inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-surface-hover hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
        <h1 className="text-lg font-semibold text-foreground">New entry</h1>
      </div>

      {/* Title */}
      <div>
        <input
          type="text"
          value={title}
          onChange={(e) => {
            if (e.target.value.length <= TITLE_MAX) setTitle(e.target.value);
          }}
          placeholder="Title"
          required
          maxLength={TITLE_MAX}
          className={inputClass}
        />
        <div className="mt-1 flex justify-end">
          <span className="text-[11px] text-muted-foreground">
            {title.length}/{TITLE_MAX}
          </span>
        </div>
      </div>

      {/* Content format toggle */}
      <div className="flex rounded-lg bg-secondary p-0.5">
        <button
          type="button"
          onClick={() => setContentFormat("text")}
          className={`flex flex-1 items-center justify-center gap-2 rounded-md py-2 text-sm font-medium transition-all ${
            contentFormat === "text"
              ? "bg-surface text-foreground shadow-sm"
              : "text-muted-foreground/60 hover:text-muted-foreground"
          }`}
        >
          <AlignLeft className="h-4 w-4" />
          Text
        </button>
        <button
          type="button"
          onClick={() => setContentFormat("checklist")}
          className={`flex flex-1 items-center justify-center gap-2 rounded-md py-2 text-sm font-medium transition-all ${
            contentFormat === "checklist"
              ? "bg-surface text-foreground shadow-sm"
              : "text-muted-foreground/60 hover:text-muted-foreground"
          }`}
        >
          <ListChecks className="h-4 w-4" />
          Checklist
        </button>
      </div>

      {/* Content */}
      {contentFormat === "text" ? (
        <div>
          <textarea
            value={contentText}
            onChange={(e) => {
              if (e.target.value.length <= CONTENT_MAX) setContentText(e.target.value);
            }}
            placeholder="Content..."
            rows={6}
            maxLength={CONTENT_MAX}
            className={`${inputClass} resize-none`}
          />
          <div className="mt-1 flex justify-end">
            <span className="text-[11px] text-muted-foreground">
              {contentText.length}/{CONTENT_MAX}
            </span>
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-secondary">
          {/* Checklist items */}
          {checklistItems.length > 0 && (
            <div className="divide-y divide-border/50">
              {checklistItems.map((item, index) => (
                <div
                  key={index}
                  className="group/item flex items-center gap-3 px-4 py-2.5"
                >
                  <div className="flex h-[18px] w-[18px] flex-shrink-0 items-center justify-center rounded-[4px] border border-muted-foreground/25" />
                  <span className="flex-1 text-sm text-foreground">{item}</span>
                  <button
                    type="button"
                    onClick={() => removeChecklistItem(index)}
                    className="rounded-md p-1.5 text-muted-foreground/40 transition-colors hover:bg-surface-hover hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
          {/* Add item input */}
          <div className={`flex items-center gap-3 px-4 py-2.5 ${checklistItems.length > 0 ? "border-t border-border/50" : ""}`}>
            <Plus className="h-[18px] w-[18px] flex-shrink-0 text-muted-foreground/30" />
            <input
              ref={checklistInputRef}
              type="text"
              enterKeyHint="done"
              value={checklistInput}
              onChange={(e) => setChecklistInput(e.target.value)}
              onKeyDown={handleChecklistKeyDown}
              placeholder="Add item..."
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none"
            />
          </div>
        </div>
      )}

      {/* Context + Type */}
      <div className="grid grid-cols-2 gap-3">
        {/* Context — Creatable Select */}
        <div ref={contextRef} className="relative">
          <div className="flex items-center rounded-lg border border-border bg-secondary focus-within:ring-2 focus-within:ring-ring">
            <input
              ref={contextInputRef}
              type="text"
              value={context}
              onChange={(e) => {
                const val = e.target.value;
                if (val.length <= CONTEXT_MAX) {
                  setContext(val);
                  if (!contextOpen) setContextOpen(true);
                }
              }}
              onFocus={() => setContextOpen(true)}
              placeholder="Context (e.g. work)"
              required
              maxLength={CONTEXT_MAX}
              className="w-full rounded-lg bg-transparent px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
            <button
              type="button"
              onClick={() => {
                setContextOpen(!contextOpen);
                if (!contextOpen) contextInputRef.current?.focus();
              }}
              className="pr-3 text-muted-foreground"
            >
              <ChevronDown className={`h-3.5 w-3.5 transition-transform ${contextOpen ? "rotate-180" : ""}`} />
            </button>
          </div>
          {contextOpen && (filteredContexts.length > 0 || showCreateOption) && (
            <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-[160px] animate-slide-down-fade overflow-y-auto rounded-lg border border-border bg-surface py-1 shadow-lg">
              {filteredContexts.map((ctx) => (
                <button
                  key={ctx}
                  type="button"
                  onClick={() => selectContext(ctx)}
                  className="block w-full px-4 py-2 text-left text-sm text-muted-foreground transition-colors hover:bg-surface-hover hover:text-foreground"
                >
                  {ctx}
                </button>
              ))}
              {showCreateOption && (
                <button
                  type="button"
                  onClick={() => selectContext(context.trim())}
                  className="block w-full px-4 py-2 text-left text-sm text-accent transition-colors hover:bg-surface-hover"
                >
                  Create &quot;{context.trim()}&quot;
                </button>
              )}
            </div>
          )}
        </div>

        {/* Type — Custom Dropdown */}
        <div ref={typeRef} className="relative">
          <button
            type="button"
            onClick={() => setTypeOpen(!typeOpen)}
            className="flex w-full items-center justify-between rounded-lg border border-border bg-secondary px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <span className="capitalize">{type}</span>
            <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${typeOpen ? "rotate-180" : ""}`} />
          </button>
          {typeOpen && (
            <div className="absolute left-0 right-0 top-full z-50 mt-1 animate-slide-down-fade rounded-lg border border-border bg-surface py-1 shadow-lg">
              {["note", "idea", "snippet", "experience"].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => {
                    setType(t);
                    setTypeOpen(false);
                  }}
                  className={`block w-full px-4 py-2 text-left text-sm capitalize transition-colors ${
                    type === t
                      ? "bg-surface-hover text-foreground"
                      : "text-muted-foreground hover:bg-surface-hover hover:text-foreground"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Tags — Chip Input */}
      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-secondary px-4 py-2.5 focus-within:ring-2 focus-within:ring-ring">
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 rounded-full bg-surface-hover px-2.5 py-1 text-xs text-foreground"
          >
            #{tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="ml-0.5 rounded-full p-0.5 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </span>
        ))}
        <input
          ref={tagInputRef}
          type="text"
          value={tagInput}
          onChange={(e) => {
            let val = e.target.value;
            if (!val.startsWith("#")) val = "#" + val.replace(/^#+/, "");
            setTagInput(val);
          }}
          onKeyDown={handleTagKeyDown}
          onFocus={handleTagFocus}
          onBlur={handleTagBlur}
          placeholder={tags.length === 0 ? "#tag" : ""}
          className="min-w-[80px] flex-1 bg-transparent py-0.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
        />
      </div>

      {/* Image upload */}
      {imagePreview ? (
        <div className="relative">
          <img
            src={imagePreview}
            alt="Preview"
            className="max-h-48 rounded-lg object-cover"
          />
          <button
            type="button"
            onClick={removeImage}
            className="absolute right-2 top-2 rounded-full bg-background/80 p-2"
          >
            <X className="h-5 w-5 text-foreground" />
          </button>
        </div>
      ) : (
        <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-border px-4 py-3 text-sm text-muted-foreground transition-colors hover:border-foreground hover:text-foreground">
          <ImagePlus className="h-4 w-4" />
          Attach image
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />
        </label>
      )}

      {/* Rating + Price — inline like other fields */}
      <div className="grid grid-cols-2 gap-3">
        {/* Rating */}
        <div className="flex items-center gap-2 rounded-lg border border-border bg-secondary px-4 py-3">
          <span className="text-sm text-muted-foreground">Rating</span>
          <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(rating === star ? null : star)}
                className="p-1 transition-colors"
              >
                <Star
                  className={`h-4 w-4 ${
                    rating !== null && star <= rating
                      ? "fill-accent text-accent"
                      : "text-muted-foreground/30"
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Price */}
        <div className="flex items-center gap-2 rounded-lg border border-border bg-secondary px-4 py-3">
          <span className="text-sm text-muted-foreground">R$</span>
          <input
            type="text"
            inputMode="numeric"
            value={priceRaw ? formatPrice(priceRaw) : ""}
            onChange={(e) => handlePriceChange(e.target.value)}
            placeholder="0,00"
            className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none"
          />
        </div>
      </div>

      {error && <p className="text-xs text-destructive">{error}</p>}

      <button
        type="submit"
        disabled={loading || !title.trim() || !context.trim() || !hasContent}
        className="btn-press w-full rounded-lg bg-foreground py-3 text-sm font-medium text-background transition-all hover:opacity-90 disabled:opacity-50"
      >
        {loading ? "Saving..." : "Save entry"}
      </button>
    </form>
  );
}
