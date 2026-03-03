export const CONTEXT_ICONS = [
  "📁", "📝", "💼", "🏠", "🎮", "🎬", "🎵", "📚", "🍳", "💡",
  "🔧", "💻", "🎨", "🏋️", "🌍", "❤️", "🎯", "📷", "✈️", "🛒",
  "💰", "🧠", "📐", "🔬", "🎓", "⭐", "🌱", "🐱", "🏖️", "🎉",
] as const;

export const DEFAULT_CONTEXT_ICON = "📁";

export type ContextIcon = (typeof CONTEXT_ICONS)[number];
