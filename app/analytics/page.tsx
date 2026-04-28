"use client";

import Sidebar from "@/components/Sidebar";
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  PieChart, 
  Download, 
  Calendar,
  ChevronDown,
  ArrowRight,
  Target,
  ShoppingCart,
  Zap,
  Clock,
  LayoutDashboard
} from "lucide-react";
import { AnalyticsBarChart, AnalyticsLineChart } from "@/components/Charts";

export default function Analytics() {
  const categorySales = [
    { name: "Groceries", sales: 42500, expenses: 28400, color: "#4f46e5" },
    { name: "Dairy & Milk", sales: 28200, expenses: 21100, color: "#0ea5e9" },
    { name: "Essentials", sales: 18800, expenses: 13200, color: "#f59e0b" },
    { name: "Snacks", sales: 12900, expenses: 9100, color: "#10b981" },
  ];

  const peakHours = [
    { time: "8 AM - 10 AM", intensity: 65 },
    { time: "10 AM - 12 PM", intensity: 45 },
    { time: "12 PM - 2 PM", intensity: 25 },
    { time: "2 PM - 4 PM", intensity: 35 },
    { time: "4 PM - 6 PM", intensity: 85 },
    { time: "6 PM - 8 PM", intensity: 100 },
    { time: "8 PM - 10 PM", intensity: 75 },
  ];

  return (
    <div className="flex bg-background min-h-screen">
      <Sidebar />
      <main className="main-content flex-grow">
        {/* Modern Header with Proper Alignment */}
        <header className="flex flex-wrap justify-between items-center gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-primary font-bold text-sm uppercase mb-1">
              <BarChart3 size={16} /> Analytics Hub
            </div>
            <h1 className="text-3xl font-extrabold text-text-main tracking-tight">Business Intelligence</h1>
            <p className="text-text-muted mt-1 font-medium">Data-driven performance insights for your kirana shop.</p>
          </div>
          <div className="flex items-center gap-6">
             <div className="flex bg-surface border-2 border-border/40 rounded-2xl p-1.5 shadow-sm gap-2">
                <button className="px-6 py-2.5 text-[10px] font-black rounded-xl bg-primary text-white transition-all shadow-md shrink-0 min-w-[80px]">Monthly</button>
                <button className="px-6 py-2.5 text-[10px] font-black rounded-xl text-text-muted hover:text-primary hover:bg-primary/5 transition-all shrink-0 min-w-[80px]">Weekly</button>
                <button className="px-6 py-2.5 text-[10px] font-black rounded-xl text-text-muted hover:text-primary hover:bg-primary/5 transition-all shrink-0 min-w-[80px]">Daily</button>
             </div>
             <button className="btn btn-primary h-14 px-8 shadow-2xl shadow-primary/30 flex items-center gap-3 rounded-2xl shrink-0">
                <Download size={18} />
                <span>Export Report</span>
             </button>
          </div>
        </header>

        {/* Key Metrics Row - Redesigned */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {[
            { title: "Net Revenue", val: "₹84,250", trend: "+12%", type: "up", icon: TrendingUp, color: "#4f46e5" },
            { title: "Total Expenses", val: "₹52,120", trend: "+4%", type: "down", icon: TrendingDown, color: "#ef4444" },
            { title: "Avg. Transaction", val: "₹235", trend: "+8%", type: "up", icon: Zap, color: "#f59e0b" },
            { title: "Customers Seen", val: "342", trend: "+15%", type: "up", icon: LayoutDashboard, color: "#10b981" },
          ].map((metric, i) => (
            <div key={i} className="card relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
              <div className="flex justify-between items-start">
                <div className={`p-3 rounded-2xl bg-${metric.type === 'up' ? 'success' : 'error'}/10 text-${metric.type === 'up' ? 'success' : 'error'}`}>
                   <metric.icon size={22} />
                </div>
                <div className={`badge ${metric.type === 'up' ? 'badge-success' : 'badge-error'}`}>{metric.trend}</div>
              </div>
              <div className="mt-4">
                 <p className="text-sm font-bold text-text-muted uppercase tracking-wider">{metric.title}</p>
                 <h3 className="text-3xl font-black mt-1 text-text-main">{metric.val}</h3>
              </div>
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12 group-hover:scale-110 transition-transform"></div>
            </div>
          ))}
        </section>

        {/* Analytics Main Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
          {/* Revenue Breakdown Chart Section */}
          <div className="lg:col-span-2 card">
            <div className="flex items-center justify-between mb-8">
               <h3 className="text-xl font-bold flex items-center gap-2"><ShoppingCart className="text-primary" /> Sales Distribution</h3>
               <button className="text-sm font-bold text-primary flex items-center gap-1 hover:underline">View Categories <ArrowRight size={14} /></button>
            </div>
            
            <div className="flex flex-col gap-6">
               {categorySales.map((cat, i) => (
                 <div key={i}>
                    <div className="flex justify-between items-center mb-2">
                       <span className="font-bold text-sm">{cat.name}</span>
                       <span className="font-mono text-sm font-bold text-text-main">₹{cat.sales.toLocaleString()}</span>
                    </div>
                    <div className="h-3 w-full bg-background rounded-full overflow-hidden border border-border/50">
                       <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${(cat.sales / categorySales[0].sales) * 100}%`, backgroundColor: cat.color }}></div>
                    </div>
                    <div className="flex justify-between text-[10px] mt-1 font-bold">
                       <span className="text-text-muted uppercase tracking-tighter">Profit: ₹{(cat.sales - cat.expenses).toLocaleString()}</span>
                       <span className="text-success uppercase">{( ((cat.sales - cat.expenses)/cat.sales)*100 ).toFixed(0)}% Margin</span>
                    </div>
                 </div>
               ))}
            </div>
          </div>

          {/* Peak Business Visibility Center */}
          <div className="card bg-surface flex flex-col">
             <h3 className="text-xl font-bold mb-8 flex items-center gap-2"><Clock className="text-accent" /> Hourly Operations</h3>
             
             <div className="flex-grow flex flex-col gap-4">
                {peakHours.map((hour, i) => (
                  <div key={i} className="flex items-center gap-4">
                     <span className="text-[10px] font-bold text-text-muted w-24 shrink-0">{hour.time}</span>
                     <div className="flex-grow h-2 bg-background rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-700 ${hour.intensity > 80 ? 'bg-accent' : hour.intensity > 50 ? 'bg-primary' : 'bg-primary/30'}`} 
                          style={{ width: `${hour.intensity}%` }}
                        />
                     </div>
                  </div>
                ))}
             </div>

             <div className="mt-8 p-4 bg-primary/5 rounded-2xl border border-primary/20">
                <div className="flex items-center gap-2 mb-2">
                   <Target size={18} className="text-primary" />
                   <h4 className="font-bold text-sm">Strategic Insight</h4>
                </div>
                <p className="text-xs font-medium text-text-muted leading-relaxed">
                  Your peak traffic is concentrated between <span className="text-primary font-extrabold uppercase tracking-tighter">6 PM - 8 PM</span>. 
                  Deploying additional staff or focusing on pre-packaged stock during this window could boost revenue by up to 14%.
                </p>
             </div>
          </div>
        </div>

        {/* Comparative Trends Section with Real Charts */}
        <section className="card bg-gradient-to-br from-surface to-primary/5 border-primary/20 mb-8">
           <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold">Historical Performance Comparison</h3>
              <div className="flex items-center gap-4">
                 <span className="flex items-center gap-1.5 text-xs font-bold text-text-main"><div className="w-3 h-3 bg-primary rounded-sm"></div> This Year</span>
                 <span className="flex items-center gap-1.5 text-xs font-bold text-text-muted"><div className="w-3 h-3 bg-primary/20 rounded-sm"></div> Last Year</span>
              </div>
           </div>
           
           <div className="h-64 mt-6 w-full">
              <AnalyticsBarChart 
                labels={["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]}
                data={[45000, 55000, 65000, 50000, 75000, 85000, 95000, 80000, 70000, 60000, 50000, 65000]}
              />
           </div>
           
           <div className="mt-8 pt-8 border-t border-border/40 flex items-center justify-between">
              <div className="flex items-center gap-10">
                 <div>
                    <h4 className="text-[10px] font-black uppercase text-text-muted mb-1">Growth Forecast</h4>
                    <p className="text-lg font-black text-text-main">+24.5% <span className="text-xs font-bold text-success ml-1">Optimistic</span></p>
                 </div>
                 <div>
                    <h4 className="text-[10px] font-black uppercase text-text-muted mb-1">YoY Average</h4>
                    <p className="text-lg font-black text-text-main">₹62.8K <span className="text-xs font-bold text-text-muted ml-1">Steady</span></p>
                 </div>
              </div>
              <button className="btn btn-secondary text-xs h-10 px-5 uppercase tracking-widest font-black">Generate Forecast Audit</button>
           </div>
        </section>

        {/* Global Action Footer */}
        <div className="mt-12 p-8 rounded-[32px] bg-primary text-white flex flex-col md:flex-row items-center justify-between gap-8 overflow-hidden relative">
           <div className="relative z-10">
              <h2 className="text-3xl font-black mb-2 leading-tight">Ready to scale your business?</h2>
              <p className="text-white/80 font-medium">Download the full quarterly projection audit powered by Azure AI.</p>
           </div>
           <div className="flex gap-4 relative z-10">
              <button className="btn bg-white text-primary border-none font-black px-8 py-4 hover:scale-105 shadow-xl">Pre-order Stock</button>
              <button className="btn bg-primary-hover border border-white/30 text-white font-black px-8 py-4 hover:bg-white hover:text-primary">Full AI Audit</button>
           </div>
           {/* Abstract Design Elements */}
           <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
           <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-2xl -ml-24 -mb-24"></div>
        </div>
      </main>
    </div>
  );
}
