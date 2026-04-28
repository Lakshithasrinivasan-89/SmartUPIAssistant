"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import { 
  Package, 
  Search, 
  Filter, 
  Plus, 
  Edit3, 
  Trash2, 
  AlertTriangle,
  TrendingUp,
  ArrowDownCircle,
  BarChart2,
  ChevronRight,
  ShoppingCart
} from "lucide-react";

export default function Inventory() {
  const [items, setItems] = useState([
    { id: 1, name: "Cooking Oil (1L Bottle)", category: "Groceries", stock: 3, costPrice: 95, sellingPrice: 130, reorderLevel: 5, lastSold: "2 hours ago" },
    { id: 2, name: "Sugar (1kg Packet)", category: "Essentials", stock: 8, costPrice: 38, sellingPrice: 48, reorderLevel: 10, lastSold: "45 mins ago" },
    { id: 3, name: "Basmati Rice (5kg)", category: "Groceries", stock: 12, costPrice: 420, sellingPrice: 550, reorderLevel: 5, lastSold: "1 day ago" },
    { id: 4, name: "Milk (500ml)", category: "Dairy", stock: 15, costPrice: 22, sellingPrice: 28, reorderLevel: 10, lastSold: "10 mins ago" },
    { id: 5, name: "Tea Powder (250g)", category: "Essentials", stock: 20, costPrice: 85, sellingPrice: 110, reorderLevel: 8, lastSold: "4 hours ago" },
  ]);

  return (
    <div className="flex bg-background min-h-screen">
      <Sidebar />
      <main className="main-content flex-grow">
        {/* Inventory Header - Redesigned for Alignment */}
        <header className="flex flex-wrap justify-between items-end gap-6 mb-10">
          <div>
            <div className="flex items-center gap-2 text-primary font-black text-xs uppercase tracking-widest mb-2">
               <Package size={14} /> Stock Management
            </div>
            <h1 className="text-4xl font-black text-text-main tracking-tight">Active Inventory</h1>
            <p className="text-text-muted mt-1 font-medium">Monitoring stock levels with predictive restocking alerts.</p>
          </div>
          <div className="flex gap-4">
            <button className="btn btn-primary h-12 px-8 flex items-center gap-3 rounded-xl text-sm font-black shadow-xl shadow-primary/25 hover:scale-105 transition-all">
              <Plus size={20} />
              Add Product
            </button>
          </div>
        </header>

        {/* Global Stock Stats */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {[
            { label: "Total Asset Count", value: "48 SKUs", icon: Package, color: "primary", badge: "Healthy" },
            { label: "Critically Low", value: "7 Items", icon: AlertTriangle, color: "error", badge: "Action Required" },
            { label: "Fastest Selling", value: "Dairy Prod.", icon: TrendingUp, color: "success", badge: "+12% Growth" },
          ].map((stat, i) => (
            <div key={i} className="card p-7 group cursor-pointer hover:border-primary/20 transition-all shadow-lg hover:shadow-2xl">
               <div className="flex justify-between items-start mb-6">
                  <div className={`h-14 w-14 rounded-2xl bg-${stat.color}/10 text-${stat.color} flex items-center justify-center shadow-sm`}>
                     <stat.icon size={28} />
                  </div>
                  <span className={`text-[9px] font-black px-2 py-1 bg-${stat.color}/10 text-${stat.color} uppercase tracking-widest rounded`}>{stat.badge}</span>
               </div>
               <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1.5">{stat.label}</p>
               <h3 className={`text-3xl font-black text-text-main`}>{stat.value}</h3>
            </div>
          ))}
        </section>

        {/* Predictive Insight Card */}
        <div className="card bg-accent/5 border-2 border-dashed border-accent/20 mb-12 p-8 flex flex-col md:flex-row items-center justify-between gap-8 group">
          <div className="flex items-center gap-6">
            <div className="h-16 w-16 rounded-3xl bg-accent text-white flex items-center justify-center shadow-xl shadow-accent/20 group-hover:scale-110 transition-transform">
              <BarChart2 size={32} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                 <span className="text-[10px] font-black uppercase text-accent tracking-tighter bg-accent/10 px-2 py-0.5 rounded">AI Recommendation</span>
                 <h4 className="font-black text-xl text-text-main">Basmati Rice (5kg) Restock</h4>
              </div>
              <p className="text-sm font-medium text-text-muted max-w-lg leading-relaxed">
                Sales velocity has increased by <span className="text-accent font-black">24%</span> this weekend. Current stock will be depleted in 48 hours. Consider ordering <span className="text-accent font-black underline">20 units</span> now to avoid stock-out.
              </p>
            </div>
          </div>
          <button className="btn btn-primary bg-accent hover:bg-accent/80 h-14 px-8 shadow-xl shadow-accent/20 font-black flex items-center gap-2 rounded-2xl">
             <ShoppingCart size={18} />
             Confirm Replenish Plan
          </button>
        </div>

        {/* Master Inventory Ledger */}
        <div className="card p-0 overflow-hidden pt-6">
          <div className="px-8 pb-6 flex flex-wrap items-center justify-between gap-6">
             <div className="flex items-center gap-3">
                <div className="h-6 w-1.5 bg-primary rounded-full"></div>
                <h3 className="text-xl font-black text-text-main uppercase tracking-tight">Active Stock Ledger</h3>
             </div>
             <div className="flex items-center gap-3 bg-surface p-1.5 border border-border/60 rounded-2xl shadow-sm">
                <div className="relative">
                   <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                   <input className="input pl-10 border-none bg-background/50 h-11 w-72 text-sm font-bold placeholder:text-text-muted/50 rounded-xl" placeholder="Quick Search items..." />
                </div>
                <button className="btn btn-secondary border-none bg-background h-11 px-4 text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:bg-primary/10">
                   <Filter size={16} /> Filters
                </button>
             </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-background/50 text-left">
                  <th className="px-8 py-5 font-black text-text-muted text-[10px] uppercase tracking-widest">Product Information</th>
                  <th className="px-8 py-5 font-black text-text-muted text-[10px] uppercase tracking-widest">Category</th>
                  <th className="px-8 py-5 font-black text-text-muted text-[10px] uppercase tracking-widest">Quantity</th>
                  <th className="px-4 py-5 font-black text-text-muted text-[10px] uppercase tracking-widest">Status Hub</th>
                  <th className="px-8 py-5 font-black text-text-muted text-[10px] uppercase tracking-widest text-right">Mngmt. Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {items.map((item) => {
                  const isLow = item.stock <= item.reorderLevel;
                  
                  return (
                    <tr key={item.id} className="hover:bg-primary/5 transition-all group font-bold">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                           <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-surface border border-border group-hover:scale-110 transition-transform">
                              <Package size={20} className="text-text-muted" />
                           </div>
                           <div>
                             <p className="font-black text-text-main group-hover:text-primary transition-colors">{item.name}</p>
                             <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[10px] text-text-muted uppercase">Last Sold:</span>
                                <span className="text-[10px] text-primary font-black uppercase tracking-tighter">{item.lastSold}</span>
                             </div>
                           </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 uppercase tracking-widest text-[10px] text-text-muted font-black">{item.category}</td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2">
                           <span className={`text-base font-black ${isLow ? 'text-error animate-pulse' : 'text-text-main'}`}>{item.stock}</span>
                           <span className="text-[10px] text-text-muted uppercase tracking-tighter">Units</span>
                        </div>
                      </td>
                      <td className="px-4 py-6">
                        <div className={`badge ${isLow ? 'badge-error' : 'badge-success'} flex items-center gap-1.5 w-fit font-black rounded-lg uppercase tracking-widest py-1.5`}>
                          {isLow ? <ArrowDownCircle size={12} /> : null}
                          {isLow ? 'Restock Imminent' : 'Optimized'}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex justify-end gap-3">
                          <button className="h-10 w-10 flex items-center justify-center rounded-xl bg-background border border-border/80 text-text-muted hover:bg-primary/10 hover:text-primary transition-all">
                            <Edit3 size={16} />
                          </button>
                          <button className="h-10 w-10 flex items-center justify-center rounded-xl bg-background border border-border/80 text-text-muted hover:bg-error/10 hover:text-error transition-all">
                            <Trash2 size={16} />
                          </button>
                          <button className="h-10 w-10 flex items-center justify-center rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all shadow-sm">
                            <ChevronRight size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
