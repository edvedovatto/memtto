import {
  Folder,
  FileText,
  Briefcase,
  Home,
  Gamepad2,
  Film,
  Music,
  BookOpen,
  UtensilsCrossed,
  Lightbulb,
  Wrench,
  Laptop,
  Palette,
  Dumbbell,
  Globe,
  Heart,
  Target,
  Camera,
  Plane,
  ShoppingCart,
  Wallet,
  Brain,
  Compass,
  FlaskConical,
  GraduationCap,
  Star,
  Sprout,
  Cat,
  Umbrella,
  PartyPopper,
  type LucideIcon,
} from "lucide-react";

export const CONTEXT_ICON_MAP: Record<string, LucideIcon> = {
  Folder,
  FileText,
  Briefcase,
  Home,
  Gamepad2,
  Film,
  Music,
  BookOpen,
  UtensilsCrossed,
  Lightbulb,
  Wrench,
  Laptop,
  Palette,
  Dumbbell,
  Globe,
  Heart,
  Target,
  Camera,
  Plane,
  ShoppingCart,
  Wallet,
  Brain,
  Compass,
  FlaskConical,
  GraduationCap,
  Star,
  Sprout,
  Cat,
  Umbrella,
  PartyPopper,
};

export const CONTEXT_ICONS = Object.keys(CONTEXT_ICON_MAP);

export const DEFAULT_CONTEXT_ICON = "Folder";

export function getIcon(name?: string): LucideIcon {
  return (
    CONTEXT_ICON_MAP[name || ""] || CONTEXT_ICON_MAP[DEFAULT_CONTEXT_ICON]
  );
}
