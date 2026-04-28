import type React from "react";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";

export function Card({ className, children }: React.PropsWithChildren<{ className?: string }>) {
  return (
    <div
      className={twMerge(
        clsx(
          "rounded-2xl border border-zinc-200 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/40"
        ),
        className
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children }: React.PropsWithChildren<{ className?: string }>) {
  return <div className={twMerge("mb-2 flex items-center justify-between", className)}>{children}</div>;
}

export function CardTitle({ className, children }: React.PropsWithChildren<{ className?: string }>) {
  return <h2 className={twMerge("text-sm font-semibold text-zinc-900 dark:text-zinc-50", className)}>{children}</h2>;
}

export function CardValue({ className, children }: React.PropsWithChildren<{ className?: string }>) {
  return <div className={twMerge("text-2xl font-bold text-zinc-900 dark:text-zinc-50", className)}>{children}</div>;
}

