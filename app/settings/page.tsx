"use client";

import Sidebar from "@/components/Sidebar";
import { 
  User, 
  Settings as SettingsIcon, 
  Bell, 
  Languages, 
  Database, 
  ShieldCheck, 
  Smartphone,
  CreditCard,
  Cloud,
  ChevronRight
} from "lucide-react";

export default function Settings() {
  const settingsSections = [
    { title: "Business Profile", icon: User, desc: "Manage your shop name, owner details and location." },
    { title: "Notifications", icon: Bell, desc: "Configure alerts for low stock and peak hour sales." },
    { title: "Language & Regional", icon: Languages, desc: "Change UI language (Hindi, Kannada, etc.) and currency settings." },
    { title: "Data Management", icon: Database, desc: "Backup your business data or export to CSV/Excel." },
    { title: "Security", icon: ShieldCheck, desc: "Change password and manage active login sessions." },
    { title: "Device Sync", icon: Smartphone, desc: "Connect other mobile devices or printers." },
    { title: "Payment Gateways", icon: CreditCard, desc: "Manage UPI IDs and merchant bank accounts." },
    { title: "Cloud Integration", icon: Cloud, desc: "Sync with Azure AI, Power BI, and other Microsoft cloud services." },
  ];

  return (
    <div className="flex bg-background min-h-screen">
      <Sidebar />
      <main className="main-content flex-grow">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-text-main">System Settings</h1>
            <p className="text-text-muted mt-1">Configure your assistant and manage system preferences.</p>
          </div>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {settingsSections.map((section, i) => {
            const Icon = section.icon;
            return (
              <div key={i} className="card group cursor-pointer hover:border-primary/50 transition-all flex flex-col gap-4">
                <div className="flex items-center justify-between">
                   <div className="h-12 w-12 bg-primary/10 text-primary flex items-center justify-center rounded-2xl group-hover:bg-primary group-hover:text-white transition-all">
                      <Icon size={24} />
                   </div>
                   <ChevronRight size={20} className="text-text-muted group-hover:translate-x-1 transition-all" />
                </div>
                <div>
                   <h3 className="font-bold text-lg mb-1">{section.title}</h3>
                   <p className="text-sm text-text-muted leading-relaxed">{section.desc}</p>
                </div>
              </div>
            );
          })}
        </section>

        {/* Business Settings Preview */}
        <div className="card">
           <h3 className="text-xl font-bold mb-6">Quick Business Status</h3>
           <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between p-4 bg-background rounded-xl border border-border">
                 <div className="flex items-center gap-4">
                    <div className="h-10 w-10 bg-success/20 text-success flex items-center justify-center rounded-lg">
                       <ShieldCheck size={20} />
                    </div>
                    <div>
                       <p className="font-bold">Account Status: Active</p>
                       <p className="text-xs text-text-muted">Pro Plan (Hackathon Edition)</p>
                    </div>
                 </div>
                 <button className="text-primary font-bold text-sm">Manage</button>
              </div>

              <div className="flex items-center justify-between p-4 bg-background rounded-xl border border-border">
                 <div className="flex items-center gap-4">
                    <div className="h-10 w-10 bg-primary/20 text-primary flex items-center justify-center rounded-lg">
                       <Cloud size={20} />
                    </div>
                    <div>
                       <p className="font-bold">Azure AI Sync: Online</p>
                       <p className="text-xs text-text-muted">Analyzing sales trends in real-time</p>
                    </div>
                 </div>
                 <button className="text-primary font-bold text-sm">Configure</button>
              </div>
           </div>
        </div>

        {/* Footer info */}
        <div className="mt-12 text-center text-text-muted text-xs font-semibold">
           <p>Small Business Smart Assistant (UPI++) v1.0.0-beta</p>
           <p className="mt-2">Made with pride for the Future Business Hackathon</p>
        </div>
      </main>
    </div>
  );
}
