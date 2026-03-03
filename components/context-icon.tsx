import { getIcon } from "@/lib/context-icons";

export function ContextIcon({
  name,
  className,
}: {
  name?: string;
  className?: string;
}) {
  const Icon = getIcon(name);
  return <Icon className={className} />;
}
