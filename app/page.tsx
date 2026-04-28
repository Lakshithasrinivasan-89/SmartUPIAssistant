import Sidebar from "@/components/Sidebar";
import StatCard from "@/components/StatCard";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShoppingBag, 
  Clock, 
  Target,
  ArrowRight,
  Plus,
  Zap
} from "lucide-react";

export default function Dashboard() {
  const stats = [
    { title: "Today's Sales", value: "₹4,250", trend: "+12.5%", trendType: "up", icon: DollarSign, color: "#4f46e5" },
    { title: "Weekly Revenue", value: "₹28,400", trend: "+8.2%", trendType: "up", icon: TrendingUp, color: "#0ea5e9" },
    { title: "Total Expenses", value: "₹1,120", trend: "-2.4%", trendType: "down", icon: TrendingDown, color: "#ef4444" },
    { title: "Est. Net Profit", value: "₹3,130", trend: "+15.8%", trendType: "up", icon: Target, color: "#10b981" },
  ];

  const recentTransactions = [
    { id: 1, name: "Rahul S.", amount: 450, time: "2:30 PM", status: "success", method: "GPay" },
    { id: 2, name: "Self - Stock Purchase", amount: -850, time: "1:15 PM", status: "success", method: "UPI-Bank" },
    { id: 3, name: "Pooja V.", amount: 120, time: "12:45 PM", status: "success", method: "Paytm" },
    { id: 4, name: "Unknown Customer", amount: 65, time: "11:20 AM", status: "success", method: "PhonePe" },
  ];

  return (
    <div className="flex bg-background min-h-screen">
      <Sidebar />
      <main className="main-content flex-grow">
        {/* Unified Header with Precise Spacing */}
        <header className="flex flex-wrap justify-between items-end gap-6 mb-10">
          <div>
            <div className="flex items-center gap-2 text-primary font-black text-xs uppercase tracking-widest mb-2">
               <Zap size={14} /> Live Retail Console
            </div>
            <h1 className="text-4xl font-black text-text-main tracking-tight">Vitals Overview</h1>
            <p className="text-text-muted mt-1 font-medium">Monitoring your shop's performance in real-time.</p>
          </div>
          <div className="flex gap-3">
            <button className="btn btn-secondary h-12 px-6 flex items-center gap-2 rounded-xl text-sm font-black border-2 border-border/50 hover:border-primary/30 transition-all">
              <Plus size={18} />
              Manual Sale
            </button>
            <button className="btn btn-primary h-12 px-6 flex items-center gap-2 rounded-xl text-sm font-black shadow-lg shadow-primary/20 hover:scale-105">
              <ShoppingBag size={18} />
              Add Stock
            </button>
          </div>
        </header>

        {/* Stats Grid - High Density Alignment */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {stats.map((stat, i) => (
            <StatCard key={i} {...(stat as any)} />
          ))}
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activity Table - Redesigned for Alignment */}
          <section className="lg:col-span-2 card flex flex-col pt-8">
            <div className="flex items-center justify-between mb-8 px-2">
               <div className="flex items-center gap-3">
                  <div className="h-2 w-8 bg-primary rounded-full"></div>
                  <h2 className="text-xl font-black text-text-main uppercase tracking-tight">Recent Activity</h2>
               </div>
               <button className="text-primary font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:translate-x-1 transition-transform">
                 Full Ledger <ArrowRight size={14} />
               </button>
            </div>
            
            <div className="flex flex-col gap-3">
              {recentTransactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-5 rounded-2xl hover:bg-primary/5 transition-all border border-border/40 group">
                  <div className="flex items-center gap-5">
                    <div className={`h-12 w-12 flex items-center justify-center rounded-2xl shadow-sm transition-transform group-hover:scale-110 ${tx.amount > 0 ? 'bg-success/15 text-success' : 'bg-error/15 text-error'}`}>
                      {tx.amount > 0 ? <TrendingUp size={22} /> : <TrendingDown size={22} />}
                    </div>
                    <div>
                      <h4 className="font-black text-text-main text-base">{tx.name}</h4>
                      <p className="text-xs font-bold text-text-muted mt-0.5">{tx.time} • <span className="text-primary/70">{tx.method}</span></p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-black ${tx.amount > 0 ? 'text-success' : 'text-error'}`}>
                      {tx.amount > 0 ? `+₹${tx.amount}` : `-₹${Math.abs(tx.amount)}`}
                    </p>
                    <div className="flex items-center justify-end gap-1.5 mt-1">
                       <div className="w-1.5 h-1.5 rounded-full bg-success"></div>
                       <span className="text-[10px] font-black text-success uppercase tracking-widest">Confirmed</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* AI Insights and Alerts Panel - Solid Alignment */}
          <section className="flex flex-col gap-6">
            <div className="card bg-primary text-white border-none relative overflow-hidden p-8 flex flex-col justify-between min-h-[200px] shadow-2xl shadow-primary/20">
              <div className="relative z-10">
                <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center mb-6">
                   <Target size={22} />
                </div>
                <h3 className="text-xl font-black mb-2 uppercase tracking-tight">Peak Demand Alert</h3>
                <p className="text-white/80 text-sm font-medium leading-relaxed">
                  Traffic usually spikes at <span className="text-white font-black underline decoration-2">6:00 PM</span>. Ensure GPay scanner is ready.
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest mt-6 relative z-10 bg-white/10 w-fit px-3 py-1.5 rounded-full">
                 <Clock size={14} />
                 <span>In 2 hours</span>
              </div>
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
              <div className="absolute bottom-0 right-0 w-48 h-48 bg-black/5 rounded-full -mr-24 -mb-24"></div>
            </div>

            <div className="card pt-8">
              <div className="flex items-center gap-3 mb-6">
                 <div className="h-1.5 w-6 bg-error rounded-full"></div>
                 <h3 className="text-lg font-black uppercase tracking-tight">Stock Warnings</h3>
              </div>
              <div className="flex flex-col gap-4">
                {[
                  { name: "Cooking Oil (1L)", stock: 3, level: "Critical", color: "error" },
                  { name: "Sugar (1kg)", stock: 8, level: "Low", color: "warning" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-background border border-border/50 hover:border-error/20 transition-all">
                    <div>
                      <p className="font-black text-sm text-text-main">{item.name}</p>
                      <p className="text-[10px] font-bold text-text-muted mt-0.5 uppercase">{item.stock} Units Remaining</p>
                    </div>
                    <span className={`text-[9px] font-black px-2 py-1 rounded shadow-sm border ${
                       item.color === 'error' ? 'bg-error/10 text-error border-error/20' : 'bg-accent/10 text-accent border-accent/20'
                    } uppercase tracking-widest`}>
                      {item.level}
                    </span>
                  </div>
                ))}
              </div>
              <button className="btn btn-secondary w-full mt-6 text-xs font-black py-4 border-2 border-border/60 uppercase tracking-widest hover:bg-background hover:border-primary/40">
                 Order Replenishment
              </button>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
