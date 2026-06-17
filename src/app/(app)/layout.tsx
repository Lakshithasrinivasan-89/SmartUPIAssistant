"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { LogoutButton } from "@/components/LogoutButton";

interface AppLayoutUser {
  id: string;
  name: string;
  role: string;
  email: string;
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppLayoutUser | null>(null);

  useEffect(() => {
    let alive = true;
    async function loadUser() {
      try {
        const res = await fetch("/api/auth/me");
        if (!res.ok) throw new Error("Failed");
        const data = await res.json();
        if (alive && data.user) {
          setUser(data.user);
        }
      } catch {
        // Fallback demo user if API fails or user not logged in
        if (alive) {
          setUser({
            id: "demo-user-id",
            name: "Lakshmi Kirana",
            role: "vendor",
            email: "demo@upiplus.dev",
          });
        }
      }
    }
    loadUser();
    return () => {
      alive = false;
    };
  }, []);

  const userName = user?.name ?? "Lakshmi Kirana";
  const userRole = user?.role ?? "vendor";

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <header className="sticky top-0 z-20 border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-black/70">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 p-3">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="font-extrabold text-zinc-900 dark:text-zinc-50">
              UPI++
            </Link>
            <div className="hidden sm:block text-xs text-zinc-600 dark:text-zinc-300">
              {userName} • {userRole}
            </div>
          </div>
          {user ? <LogoutButton /> : null}
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-4 p-4 lg:grid-cols-[260px_1fr] lg:gap-6">
        <nav className="rounded-2xl border border-zinc-200 bg-white/70 p-3 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/40">
          <div className="mb-2 px-2 text-xs font-semibold text-zinc-600 dark:text-zinc-300">Menu</div>
          <div className="flex flex-col gap-1">
            <NavItem href="/dashboard" label="Dashboard" />
            <NavItem href="/transactions" label="Transactions" />
            <NavItem href="/expenses" label="Expenses" />
            <NavItem href="/inventory" label="Inventory" />
            <NavItem href="/assistant" label="Assistant" />
            <NavItem href="/reports" label="Reports" />
            <NavItem href="/settings" label="Settings" />
          </div>
        </nav>

        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}

function NavItem({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="rounded-xl px-3 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-100 dark:text-zinc-100 dark:hover:bg-zinc-800"
    >
      {label}
    </Link>
  );
}
