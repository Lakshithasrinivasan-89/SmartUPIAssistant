"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import { 
  PieChart, 
  TrendingDown, 
  Plus, 
  Calendar, 
  Search, 
  Trash2, 
  Edit3, 
  AlertCircle,
  IndianRupee,
  ShoppingBag,
  Zap,
  Truck
} from "lucide-react";

export default function Expenses() {
  const [expenses, setExpenses] = useState([
    { id: 1, category: "Shop Rent", amount: 6500, date: "2026-03-01", description: "Monthly rent for March", icon: ShoppingBag, color: "#4f46e5" },
    { id: 2, category: "Electricity", amount: 1250, date: "2026-03-12", description: "Month-end bill", icon: Zap, color: "#f59e0b" },
    { id: 3, category: "Transport", amount: 850, date: "2026-03-15", description: "Stock delivery from city", icon: Truck, color: "#0ea5e9" },
    { id: 4, category: "Miscellaneous", amount: 450, date: "2026-03-22", description: "Packaging materials", icon: AlertCircle, color: "#64748b" },
  ]);

  const totalExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="flex bg-background min-h-screen">
      <Sidebar />
      <main className="main-content flex-grow">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-text-main">Expense Tracking</h1>
            <p className="text-text-muted mt-1">Monitor and categorize all business-related expenditures.</p>
          </div>
          <button className="btn btn-primary">
            <Plus size={18} />
            Add New Expense
          </button>
        </header>

        {/* Expense Summary Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="card">
             <div className="flex items-center gap-3 mb-2">
                <div className="h-8 w-8 bg-error/10 text-error flex items-center justify-center rounded-lg">
                   <TrendingDown size={18} />
                </div>
                <p className="text-sm font-bold text-text-muted uppercase">Total Monthly</p>
             </div>
             <h3 className="text-2xl font-bold">₹{totalExpenses.toLocaleString()}</h3>
          </div>
          
          <div className="card">
             <div className="flex items-center gap-3 mb-2">
                <div className="h-8 w-8 bg-primary/10 text-primary flex items-center justify-center rounded-lg">
                   <IndianRupee size={18} />
                </div>
                <p className="text-sm font-bold text-text-muted uppercase">Average per Day</p>
             </div>
             <h3 className="text-2xl font-bold">₹{(totalExpenses / 30).toFixed(0)}</h3>
          </div>

          <div className="card lg:col-span-2 bg-gradient-to-r from-surface to-background border-dashed">
             <p className="text-sm font-bold text-text-muted uppercase mb-4">Top Spending Category</p>
             <div className="flex items-center gap-6">
                <div className="h-14 w-14 bg-indigo-100 text-indigo-600 flex items-center justify-center rounded-2xl">
                   <ShoppingBag size={28} />
                </div>
                <div>
                   <h3 className="text-xl font-bold">Shop Rent (₹6,500)</h3>
                   <p className="text-sm text-text-muted">Accounts for 71% of total monthly expenses.</p>
                </div>
             </div>
          </div>
        </section>

        {/* Expenses List */}
        <div className="card p-0 overflow-hidden">
          <div className="p-6 border-b border-border flex flex-wrap items-center justify-between gap-4">
             <h3 className="text-xl font-bold flex items-center gap-2">
                <PieChart className="text-primary" size={20} /> Expense History
             </h3>
             <div className="flex items-center gap-2">
                <div className="relative">
                   <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                   <input className="input pl-9 h-10 w-64 text-sm" placeholder="Search expenses..." />
                </div>
                <button className="btn btn-secondary h-10 text-sm">
                   <Calendar size={16} /> Filter Date
                </button>
             </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-background text-left divide-x divide-transparent">
                  <th className="px-6 py-4 font-bold text-text-muted text-sm uppercase">Category</th>
                  <th className="px-6 py-4 font-bold text-text-muted text-sm uppercase">Amount</th>
                  <th className="px-6 py-4 font-bold text-text-muted text-sm uppercase">Date</th>
                  <th className="px-6 py-4 font-bold text-text-muted text-sm uppercase">Description</th>
                  <th className="px-6 py-4 font-bold text-text-muted text-sm uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {expenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-background/50 transition-all font-medium">
                    <td className="px-6 py-5">
                       <div className="flex items-center gap-3">
                          <div 
                             className="h-10 w-10 flex items-center justify-center rounded-xl"
                             style={{ backgroundColor: `${exp.color}15`, color: exp.color }}
                          >
                             <exp.icon size={20} />
                          </div>
                          <span className="font-bold">{exp.category}</span>
                       </div>
                    </td>
                    <td className="px-6 py-5">
                       <span className="text-error font-extrabold flex items-center gap-1">
                          - ₹{exp.amount.toLocaleString()}
                       </span>
                    </td>
                    <td className="px-6 py-5 text-sm font-semibold">{exp.date}</td>
                    <td className="px-6 py-5 text-sm text-text-muted max-w-xs truncate">{exp.description}</td>
                    <td className="px-6 py-5">
                       <div className="flex gap-2">
                          <button className="text-text-muted hover:text-primary transition-all p-2 hover:bg-primary/10 rounded-full">
                             <Edit3 size={18} />
                          </button>
                          <button className="text-text-muted hover:text-error transition-all p-2 hover:bg-error/10 rounded-full">
                             <Trash2 size={18} />
                          </button>
                       </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="p-6 bg-background/50 border-t border-border flex items-center justify-center">
             <p className="text-sm font-bold text-text-muted italic">Showing all expenses for the current month. End search.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
