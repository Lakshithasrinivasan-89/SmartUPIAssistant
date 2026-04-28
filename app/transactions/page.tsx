"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import { 
  CreditCard, 
  Search, 
  Filter, 
  Download, 
  Plus, 
  ArrowUpRight, 
  ArrowDownLeft,
  MessageSquare,
  AlertCircle,
  Copy
} from "lucide-react";

const INITIAL_TRANSACTIONS = [
  { id: "TX-1", customer: "Rahul Sharma", amount: 450.00, type: "credit", method: "GPay", time: "2026-03-28 14:30", category: "income", status: "success" },
  { id: "TX-2", customer: "Supplier - Krishna Milk", amount: 1200.00, type: "debit", method: "Bank Transfer", time: "2026-03-28 11:15", category: "supplier", status: "success" },
  { id: "TX-3", customer: "Pooja Verma", amount: 120.00, type: "credit", method: "Paytm", time: "2026-03-28 10:45", category: "income", status: "success" },
  { id: "TX-4", customer: "Unidentified Payee", amount: 65.00, type: "credit", method: "PhonePe", time: "2026-03-28 09:20", category: "income", status: "success" },
];

export default function Transactions() {
  const [smsInput, setSmsInput] = useState("");
  const [parsingResults, setParsingResults] = useState<any[]>([]);
  const [showParser, setShowParser] = useState(false);

  // Mock parsing logic
  const handleParseSms = () => {
    if (!smsInput.trim()) return;

    // Sample regex patterns for UPI messages
    const amountRegex = /INR\s*(\d+(\.\d+)?)|Rs\.\s*(\d+(\.\d+)?)/i;
    const nameRegex = /from\s+([A-Z\s]+)|to\s+([A-Z\s]+)/i;
    
    const amountMatch = smsInput.match(amountRegex);
    const amount = amountMatch ? parseFloat(amountMatch[1] || amountMatch[3]) : 0;
    
    // Simulate parsing success
    const newTx = {
      id: `TX-${Math.floor(Math.random() * 1000)}`,
      customer: smsInput.includes("received") ? "Customer" : "Merchant",
      amount: amount,
      type: smsInput.toLowerCase().includes("received") || smsInput.toLowerCase().includes("credited") ? "credit" : "debit",
      method: smsInput.includes("GPay") ? "GPay" : smsInput.includes("PhonePe") ? "PhonePe" : "UPI",
      time: new Date().toLocaleTimeString(),
      category: smsInput.includes("received") ? "income" : "expense",
      status: "success"
    };

    setParsingResults([newTx, ...parsingResults]);
    setSmsInput("");
  };

  return (
    <div className="flex bg-background min-h-screen">
      <Sidebar />
      <main className="main-content flex-grow">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-text-main">Transactions</h1>
            <p className="text-text-muted mt-1">Manage your sales, expenses, and parsed messages.</p>
          </div>
          <div className="flex gap-4">
            <button 
              className="btn btn-secondary"
              onClick={() => setShowParser(!showParser)}
            >
              <MessageSquare size={18} />
              Parse UPI SMS
            </button>
            <button className="btn btn-primary">
              <Plus size={18} />
              Manual Transaction
            </button>
          </div>
        </header>

        {showParser && (
          <section className="animate-fade-in card mb-8 border-primary/30 bg-primary/5">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-bold">UPI SMS/Notification Demo Parser</h3>
                <p className="text-sm text-text-muted">Paste a sample UPI message to simulate automatic tracking.</p>
              </div>
              <button 
                onClick={() => setSmsInput("Rs. 450 received from RAHUL SHARMA on GPay. TXN ID: 123456789")}
                className="text-xs text-primary font-semibold hover:underline"
              >
                Use Sample Message
              </button>
            </div>
            
            <div className="flex gap-4">
              <textarea 
                className="input flex-grow min-h-[100px] text-sm"
                placeholder="Paste SMS here (e.g. Rs. 150 received via UPI...)"
                value={smsInput}
                onChange={(e) => setSmsInput(e.target.value)}
              />
              <button 
                className="btn btn-primary self-end h-12"
                onClick={handleParseSms}
              >
                Parse & Save
              </button>
            </div>
          </section>
        )}

        {/* Global Filters */}
        <div className="card mb-8 p-4 flex flex-wrap gap-4 items-center">
          <div className="relative flex-grow max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
            <input className="input pl-10" placeholder="Search by name, ID, or amount..." />
          </div>
          <div className="flex items-center gap-2">
            <button className="btn btn-secondary py-2 px-3 text-sm">
              <Filter size={16} /> Filter
            </button>
            <button className="btn btn-secondary py-2 px-3 text-sm">
              <Download size={16} /> Export
            </button>
          </div>
        </div>

        {/* Transactions Table */}
        <section className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-background text-left border-bottom border-border">
                  <th className="px-6 py-4 font-bold text-text-muted text-sm uppercase tracking-wider">Transaction ID</th>
                  <th className="px-6 py-4 font-bold text-text-muted text-sm uppercase tracking-wider">Customer/Entity</th>
                  <th className="px-6 py-4 font-bold text-text-muted text-sm uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-4 font-bold text-text-muted text-sm uppercase tracking-wider">Method</th>
                  <th className="px-6 py-4 font-bold text-text-muted text-sm uppercase tracking-wider">Date & Time</th>
                  <th className="px-6 py-4 font-bold text-text-muted text-sm uppercase tracking-wider">Category</th>
                  <th className="px-6 py-4 font-bold text-text-muted text-sm uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {[...parsingResults, ...INITIAL_TRANSACTIONS].map((tx) => (
                  <tr key={tx.id} className="hover:bg-background/50 transition-all font-medium">
                    <td className="px-6 py-4 text-sm font-mono text-primary">{tx.id}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${tx.type === 'credit' ? 'bg-success' : 'bg-error'}`}>
                          {tx.customer[0]}
                        </div>
                        {tx.customer}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`flex items-center gap-1 font-bold ${tx.type === 'credit' ? 'text-success' : 'text-error'}`}>
                        {tx.type === 'credit' ? <ArrowUpRight size={14} /> : <ArrowDownLeft size={14} />}
                        ₹{Math.abs(tx.amount).toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">{tx.method}</td>
                    <td className="px-6 py-4 text-sm text-text-muted">{tx.time}</td>
                    <td className="px-6 py-4">
                      <span className={`badge ${tx.category === 'income' ? 'badge-success' : 'badge-error'}`}>
                        {tx.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button className="text-text-muted hover:text-primary transition-all">
                        <AlertCircle size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {parsingResults.length === 0 && INITIAL_TRANSACTIONS.length === 0 && (
            <div className="p-12 text-center">
              <div className="mx-auto w-16 h-16 bg-background rounded-full flex items-center justify-center mb-4">
                <CreditCard className="text-text-muted" size={32} />
              </div>
              <p className="text-text-muted">No transactions found.</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
