"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/components/LanguageContext";
import { 
  BarChart3, 
  CreditCard, 
  Package, 
  PieChart, 
  Settings, 
  MessageSquare, 
  Home,
  LogOut,
  Target,
  ChevronRight
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();
  const { t } = useLanguage();

  const navigation = [
    { name: t.dashboard, href: "/", icon: Home },
    { name: t.transactions, href: "/transactions", icon: CreditCard },
    { name: t.expenses, href: "/expenses", icon: PieChart },
    { name: t.inventory, href: "/inventory", icon: Package },
    { name: t.analytics, href: "/analytics", icon: BarChart3 },
    { name: t.assistant, href: "/assistant", icon: MessageSquare },
    { name: t.settings, href: "/settings", icon: Settings },
  ];

  return (
    <aside className="sidebar">
      {/* Brand Identity Section */}
      <div className="flex items-center gap-4 px-4 mb-14 group cursor-pointer">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-white shadow-xl shadow-primary/40 group-hover:scale-110 transition-all duration-300">
          <Target size={28} />
        </div>
        <div className="flex flex-col">
           <span className="text-2xl font-black tracking-tight text-text-main leading-tight">UPI++</span>
           <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest opacity-80">{t.intelligenceHub}</span>
        </div>
      </div>

      {/* Navigation Stack */}
      <nav className="flex flex-col gap-2 w-full flex-grow">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`group flex items-center justify-between px-5 py-4 rounded-2xl font-bold text-sm transition-all duration-300 ${
                isActive 
                ? "bg-primary text-white shadow-lg shadow-primary/30" 
                : "text-text-muted hover:bg-primary/5 hover:text-primary"
              }`}
            >
              <div className="flex items-center gap-4">
                <Icon size={22} className={isActive ? "text-white" : "text-text-muted group-hover:text-primary transition-colors"} />
                <span className="tracking-wide">{item.name}</span>
              </div>
              {isActive && <ChevronRight size={16} className="text-white/70" />}
            </Link>
          );
        })}
      </nav>

      {/* User Session Footer (Anchored stably) */}
      <div className="mt-8 pt-6 border-t border-border/60 shrink-0">
        <div className="px-4 mb-6 flex items-center gap-4">
           <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white font-black text-xs shadow-md">
             RK
           </div>
           <div className="flex flex-col">
              <span className="text-sm font-black text-text-main">Ramu Kirana</span>
              <span className="text-[10px] font-bold text-success uppercase tracking-wider">{t.vendorPro}</span>
           </div>
        </div>
        <button className="flex items-center gap-4 px-5 py-4 rounded-2xl text-text-muted hover:bg-error/10 hover:text-error transition-all w-full font-black text-sm group">
          <LogOut size={22} className="group-hover:translate-x-1 transition-transform" />
          <span>{t.signOut}</span>
        </button>
      </div>
    </aside>
  );
}
