import type React from "react";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";

type BadgeTone = "neutral" | "success" | "warning" | "danger" | "info";

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: React.ReactNode;
  tone?: BadgeTone;
  className?: string;
}) {
  return (
    <span
      className={twMerge(
        clsx(
          "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
          "border border-zinc-200 bg-white/70 text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950/40 dark:text-zinc-50",
          tone === "success" && "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-300",
          tone === "warning" && "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-300",
          tone === "danger" && "border-red-200 bg-red-50 text-red-800 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300",
          tone === "info" && "border-sky-200 bg-sky-50 text-sky-800 dark:border-sky-900/50 dark:bg-sky-950/30 dark:text-sky-300"
        ),
        className
      )}
    >
      {children}
    </span>
  );
}

