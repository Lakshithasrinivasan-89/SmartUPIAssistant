"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";

const languages = [
  { id: "en", label: "English" },
  { id: "hi", label: "Hindi (placeholder)" },
  { id: "kn", label: "Kannada (placeholder)" },
  { id: "ta", label: "Tamil (placeholder)" },
  { id: "te", label: "Telugu (placeholder)" },
];

export default function SettingsPage() {
  const [lang, setLang] = useState("en");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((j) => setLang(j.user?.language ?? "en"))
      .catch(() => null);
  }, []);

  async function save() {
    setBusy(true);
    try {
      const res = await fetch("/api/settings/language", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language: lang }),
      });
      if (!res.ok) throw new Error("Failed");
      // refresh so assistant uses updated language
      window.location.reload();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-extrabold">Settings</CardTitle>
          <div className="text-xs text-zinc-500">Local language readiness</div>
        </CardHeader>

        <div className="flex flex-col gap-4">
          <div className="rounded-2xl border border-zinc-200 bg-white p-3">
            <div className="text-sm font-semibold">Language</div>
            <div className="text-xs text-zinc-500 mt-1">
              English is fully supported. Other languages are placeholders for future translations.
            </div>
            <div className="mt-3 max-w-sm">
              <Select label="Choose language" value={lang} onChange={(e) => setLang(e.target.value)}>
                {languages.map((l) => (
                  <option value={l.id} key={l.id}>
                    {l.label}
                  </option>
                ))}
              </Select>
            </div>
            <div className="mt-3 flex gap-2 flex-wrap">
              <Button onClick={save} disabled={busy}>
                {busy ? "Saving..." : "Save"}
              </Button>
              <Button variant="secondary" onClick={() => window.location.href = "/assistant"}>
                Go to Assistant
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

