import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  trend?: string;
  trendType?: "up" | "down" | "neutral";
  icon: LucideIcon;
  color: string;
}

export default function StatCard({ title, value, trend, trendType = "neutral", icon: Icon, color }: StatCardProps) {
  
  return (
    <div className="card animate-fade-in flex flex-col gap-6 p-7 hover:shadow-2xl hover:shadow-primary/10 transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl shadow-sm" style={{ backgroundColor: `${color}15`, color: color }}>
          <Icon size={24} />
        </div>
        {trend && (
          <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md shadow-sm border ${
            trendType === 'up' ? 'bg-success/10 text-success border-success/20' : 'bg-error/10 text-error border-error/20'
          }`}>
            {trend}
          </span>
        )}
      </div>
      <div>
        <h3 className="text-text-muted font-bold text-xs uppercase tracking-widest mb-1.5">{title}</h3>
        <p className="text-3xl font-black mt-2 text-text-main tracking-tight">{value}</p>
      </div>
    </div>
  );
}
