"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";

type ChatMsg = { id: string; role: "user" | "assistant"; text: string };

const langToSpeechCode: Record<string, string> = {
  en: "en-IN",
  hi: "hi-IN",
  kn: "kn-IN",
  ta: "ta-IN",
  te: "te-IN",
};

export default function AssistantPage() {
  const [user, setUser] = useState<any>(null);
  const [language, setLanguage] = useState<string>("en");
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [history, setHistory] = useState<ChatMsg[]>([
    { id: "a1", role: "assistant", text: "Hi! I’m UPI++. Ask me about today’s sales, profit, peak hours, or what to restock." },
  ]);

  useEffect(() => {
    let alive = true;
    async function loadUser() {
      const res = await fetch("/api/auth/me");
      const json = await res.json();
      if (!alive) return;
      setUser(json.user);
      setLanguage(json.user?.language ?? "en");
    }
    loadUser().catch(() => null);
    return () => {
      alive = false;
    };
  }, []);

  async function ask(question: string) {
    const q = question.trim();
    if (!q) return;
    const userMsg: ChatMsg = { id: crypto.randomUUID(), role: "user", text: q };
    setHistory((h) => [...h, userMsg]);
    setBusy(true);
    try {
      const res = await fetch("/api/assistant/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q, language }),
      });
      const json = await res.json();
      const answer = json.response ?? "Sorry, I couldn't answer that.";
      const assistantMsg: ChatMsg = { id: crypto.randomUUID(), role: "assistant", text: answer };
      setHistory((h) => [...h, assistantMsg]);

      if (ttsEnabled && typeof window !== "undefined" && "speechSynthesis" in window) {
        const utter = new SpeechSynthesisUtterance(answer);
        utter.lang = langToSpeechCode[language] ?? "en-IN";
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utter);
      }
    } finally {
      setBusy(false);
    }
  }

  function pickQuick(prompt: string) {
    setInput(prompt);
    ask(prompt).catch(() => null);
  }

  async function startVoice() {
    // Web Speech API (demo). This is intentionally modular so you can swap to Azure Speech later.
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice recognition not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = langToSpeechCode[language] ?? "en-IN";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    setBusy(true);
    recognition.onresult = (event: any) => {
      const text = event.results?.[0]?.[0]?.transcript ?? "";
      setInput(text);
      ask(text).catch(() => null);
      setBusy(false);
    };
    recognition.onerror = () => {
      setBusy(false);
      alert("Could not recognize speech. Please try again.");
    };
    recognition.start();
  }

  const quickPrompts = [
    "How much did I earn today?",
    "When is my peak sales time?",
    "What is my profit this week?",
    "Which items should I restock?",
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[380px_1fr]">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-extrabold">Assistant</CardTitle>
            <Badge tone="info">Voice-ready</Badge>
          </CardHeader>

          <div className="flex flex-col gap-3">
            <div className="text-sm text-zinc-600 dark:text-zinc-300">
              Ask in your local language. For now we support English fully; other languages use placeholders (English fallback).
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-white p-3">
              <div className="text-xs font-semibold text-zinc-500 mb-2">Quick questions</div>
              <div className="flex flex-col gap-2">
                {quickPrompts.map((p) => (
                  <Button key={p} variant="secondary" onClick={() => pickQuick(p)} disabled={busy}>
                    {p}
                  </Button>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-white p-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-semibold text-zinc-500">Text-to-speech</div>
                  <div className="text-sm text-zinc-700">{ttsEnabled ? "On" : "Off"}</div>
                </div>
                <Button variant="ghost" onClick={() => setTtsEnabled((v) => !v)}>
                  Toggle
                </Button>
              </div>
              <div className="text-xs text-zinc-600 mt-2">Uses browser speech synthesis for demo.</div>
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Chat</CardTitle>
            <div className="text-xs text-zinc-500">Language: {language}</div>
          </CardHeader>

          <div className="flex flex-col gap-3">
            <div className="h-[420px] overflow-auto rounded-2xl border border-zinc-100 bg-zinc-50 p-3">
              <div className="flex flex-col gap-3">
                {history.map((m) => (
                  <div key={m.id} className={m.role === "user" ? "self-end max-w-[85%]" : "self-start max-w-[85%]"}>
                    <div
                      className={
                        m.role === "user"
                          ? "rounded-2xl bg-zinc-900 px-3 py-2 text-sm text-white"
                          : "rounded-2xl bg-white px-3 py-2 text-sm text-zinc-900 border border-zinc-200"
                      }
                    >
                      {m.text}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-end gap-2">
              <div className="flex-1">
                <Input
                  label="Your question"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      ask(input).catch(() => null);
                      setInput("");
                    }
                  }}
                  placeholder="e.g. Which items should I restock?"
                  disabled={busy}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Button variant="secondary" onClick={startVoice} disabled={busy}>
                  {busy ? "Listening..." : "Voice"}
                </Button>
                <Button
                  onClick={() => {
                    ask(input).catch(() => null);
                    setInput("");
                  }}
                  disabled={busy}
                >
                  Send
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

