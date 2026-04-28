"use client";

import { useState, useEffect, useRef } from "react";
import Sidebar from "@/components/Sidebar";
import { useLanguage } from "@/components/LanguageContext";
import { Language } from "@/lib/translations";
import { 
  MessageSquare, 
  Mic, 
  Send, 
  User, 
  Bot, 
  TrendingUp, 
  Clock, 
  Package, 
  Languages,
  Volume2,
  Sparkles
} from "lucide-react";

type Message = {
  role: "user" | "assistant";
  content: string;
  type?: "text" | "insight" | "chart";
};

export default function Assistant() {
  const { language, setLanguage, t } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: t.askAssistant }
  ]);
  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Update initial message when language changes
  useEffect(() => {
    setMessages([{ role: "assistant", content: t.askAssistant }]);
  }, [language]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    
    // Simulate AI response logic
    setTimeout(() => {
      let response = "I'm analyzing your data...";
      const lowercaseInput = input.toLowerCase();

      // Language specific response mapping
      if (language === 'Hindi') {
        if (lowercaseInput.includes("बिक्री") || lowercaseInput.includes("आज")) {
           response = "आपने आज 18 लेनदेन से ₹4,250 कमाए हैं। यह कल की तुलना में 12% अधिक है।";
        } else {
           response = "मैं आपकी कैसे मदद कर सकता हूँ? आज की बिक्री काफी अच्छी रही है।";
        }
      } else if (language === 'Kannada') {
        if (lowercaseInput.includes("ಮಾರಾಟ") || lowercaseInput.includes("ಇಂದು")) {
           response = "ನೀವು ಇಂದು 18 ವಹಿವಾಟುಗಳಿಂದ ₹4,250 ಗಳಿಸಿದ್ದೀರಿ. ಇದು ನಿನ್ನೆಗಿಂತ 12% ಹೆಚ್ಚಾಗಿದೆ.";
        } else {
           response = "ನಾನು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಲಿ? ಇಂದಿನ ವ್ಯವಹಾರ ಉತ್ತಮವಾಗಿದೆ.";
        }
      } else {
        if (lowercaseInput.includes("earn") || lowercaseInput.includes("sales") || lowercaseInput.includes("today")) {
          response = "You have earned ₹4,250 today from 18 transactions. This is 12% higher than yesterday at this time. Most sales came through GPay.";
        } else if (lowercaseInput.includes("peak") || lowercaseInput.includes("time") || lowercaseInput.includes("busy")) {
          response = "Your peak sales hours are between 6:00 PM and 8:15 PM. Mondays and Saturdays are usually your busiest days.";
        } else {
          response = "I can help with that. Based on your recent activity, your business is showing steady growth.";
        }
      }

      setMessages((prev) => [...prev, { role: "assistant", content: response }]);
    }, 1000);

    setInput("");
  };

  const toggleVoice = () => {
    setIsListening(!isListening);
    if (!isListening) {
      setTimeout(() => {
        setIsListening(false);
      }, 3000);
    }
  };

  return (
    <div className="flex bg-background min-h-screen">
      <Sidebar />
      <main className="main-content flex-grow flex flex-col max-h-screen">
        <header className="flex justify-between items-start mb-10 shrink-0">
          <div>
            <div className="flex items-center gap-2 text-primary font-black text-xs uppercase tracking-widest mb-2">
               <Sparkles size={14} /> {t.intelligenceHub}
            </div>
            <h1 className="text-4xl font-black text-text-main tracking-tight">{t.assistant}</h1>
            <p className="text-text-muted mt-1 font-medium italic">Get instant insights from your business data via voice or text.</p>
          </div>
          <div className="flex items-center gap-3 bg-surface p-2.5 rounded-xl border border-border shadow-sm">
            <Languages size={18} className="text-primary" />
            <select 
              className="bg-transparent border-none outline-none font-bold text-sm cursor-pointer text-text-main"
              value={language}
              onChange={(e) => setLanguage(e.target.value as Language)}
            >
              <option value="English">English</option>
              <option value="Hindi">Hindi (हिन्दी)</option>
              <option value="Kannada">Kannada (ಕನ್ನಡ)</option>
              <option value="Tamil">Tamil (தமிழ்)</option>
              <option value="Telugu">Telugu (తెలుగు)</option>
            </select>
          </div>
        </header>

        {/* Chat Interface */}
        <div className="flex-grow card flex flex-col p-0 overflow-hidden relative border-primary/20 bg-gradient-to-br from-surface to-primary/5">
          {/* Messages Area */}
          <div 
            ref={scrollRef}
            className="flex-grow overflow-y-auto p-6 flex flex-col gap-6"
          >
            {messages.map((msg, idx) => (
              <div 
                key={idx} 
                className={`flex gap-4 max-w-[80%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
              >
                <div className={`h-10 w-10 min-w-[40px] rounded-full flex items-center justify-center shrink-0 ${
                  msg.role === 'user' ? 'bg-primary text-white' : 'bg-surface border border-border text-primary shadow-sm'
                }`}>
                  {msg.role === 'user' ? <User size={20} /> : <Bot size={20} />}
                </div>
                <div>
                  <div className={`p-4 rounded-2xl shadow-sm text-sm font-medium leading-relaxed ${
                    msg.role === 'user' 
                    ? 'bg-primary text-white rounded-tr-none' 
                    : 'bg-surface border border-border text-text-main rounded-tl-none'
                  }`}>
                    {msg.content}
                    {msg.role === 'assistant' && (
                       <button className="flex items-center gap-1 text-[10px] mt-2 text-primary font-bold hover:underline">
                         <Volume2 size={12} /> {t.readOutLoud}
                       </button>
                    )}
                  </div>
                  <p className="text-[10px] text-text-muted mt-1 px-1">
                    {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Actions Bar */}
          <div className="px-6 py-3 border-t border-border bg-surface/50 flex gap-2 overflow-x-auto no-scrollbar">
            {[
              { text: t.todaySales, icon: TrendingUp },
              { text: t.peakAlert, icon: Clock },
              { text: t.stockWarning, icon: Package },
            ].map((action, i) => (
              <button 
                key={i} 
                className="btn btn-secondary py-1 px-3 text-xs whitespace-nowrap bg-surface hover:border-primary shrink-0"
                onClick={() => setInput(action.text)}
              >
                <action.icon size={12} className="text-primary" /> {action.text}
              </button>
            ))}
          </div>

          {/* Input Area */}
          <div className="p-6 bg-surface border-t border-border">
            <div className="flex gap-4 items-center">
              <button 
                className={`h-12 w-12 rounded-full flex items-center justify-center transition-all ${
                  isListening ? 'bg-error text-white animate-pulse' : 'bg-primary/10 text-primary hover:bg-primary/20'
                }`}
                onClick={toggleVoice}
                title="Voice Input"
              >
                <Mic size={24} />
              </button>
              
              <div className="flex-grow relative">
                <input 
                  className="input h-12 pr-12 focus:ring-primary/20"
                  placeholder={isListening ? t.listening : t.askAssistant}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                />
                <button 
                  className={`absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-lg flex items-center justify-center transition-all ${
                    input.trim() ? 'bg-primary text-white shadow-md' : 'text-text-muted bg-background cursor-not-allowed'
                  }`}
                  onClick={handleSend}
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Language Placeholder Notice */}
        <div className="mt-4 flex items-center justify-center gap-2 text-xs text-text-muted font-medium bg-surface/50 py-2 rounded-lg border border-border/50 border-dashed italic">
          <Languages size={14} /> Multi-language engine is now active.
        </div>
      </main>
    </div>
  );
}
