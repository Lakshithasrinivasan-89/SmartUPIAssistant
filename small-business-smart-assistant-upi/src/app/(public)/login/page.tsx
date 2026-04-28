"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const signupSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  password: z.string().min(6),
  role: z.enum(["vendor", "user"]),
});

type LoginForm = z.infer<typeof loginSchema>;
type SignupForm = z.infer<typeof signupSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [error, setError] = useState<string | null>(null);

  const loginForm = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "demo@upiplus.dev", password: "Demo@1234" },
  });

  const signupForm = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
    defaultValues: { email: "demo2@upiplus.dev", name: "Small Vendor", password: "Demo@1234", role: "vendor" },
  });

  const action = useMemo(() => (mode === "login" ? "login" : "signup"), [mode]);

  async function onSubmit() {
    setError(null);
    try {
      if (mode === "login") {
        const values = await loginForm.handleSubmit(async (data) => data)();
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });
        if (!res.ok) {
          const e = await res.json().catch(() => ({}));
          throw new Error(e?.error || "Login failed");
        }
      } else {
        const values = await signupForm.handleSubmit(async (data) => data)();
        const res = await fetch("/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });
        if (!res.ok) {
          const e = await res.json().catch(() => ({}));
          throw new Error(e?.error || "Signup failed");
        }
      }

      router.push("/dashboard");
      router.refresh();
    } catch (e: any) {
      setError(e?.message ?? "Something went wrong");
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-4 text-center">
          <div className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-50">UPI++</div>
          <div className="text-sm text-zinc-600 dark:text-zinc-300">Small Business Smart Assistant</div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-extrabold">{mode === "login" ? "Welcome back" : "Create account"}</CardTitle>
            <div className="flex gap-2">
              <Button
                variant={mode === "login" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setMode("login")}
              >
                Login
              </Button>
              <Button
                variant={mode === "signup" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setMode("signup")}
              >
                Sign up
              </Button>
            </div>
          </CardHeader>

          <div className="p-1">
            {error ? <div className="mb-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div> : null}

            {mode === "login" ? (
              <form
                className="flex flex-col gap-3"
                onSubmit={(e) => {
                  e.preventDefault();
                  onSubmit();
                }}
              >
                <Input label="Email" type="email" autoComplete="email" {...loginForm.register("email")} error={loginForm.formState.errors.email?.message} />
                <Input
                  label="Password"
                  type="password"
                  autoComplete="current-password"
                  {...loginForm.register("password")}
                  error={loginForm.formState.errors.password?.message}
                />
                <Button type="submit" size="lg">
                  Login
                </Button>

                <div className="text-xs text-zinc-600 dark:text-zinc-300 mt-1">
                  Demo login: <span className="font-semibold">demo@upiplus.dev</span> / <span className="font-semibold">Demo@1234</span>
                </div>
              </form>
            ) : (
              <form
                className="flex flex-col gap-3"
                onSubmit={(e) => {
                  e.preventDefault();
                  onSubmit();
                }}
              >
                <Input label="Business name" {...signupForm.register("name")} error={signupForm.formState.errors.name?.message} />
                <Input label="Email" type="email" autoComplete="email" {...signupForm.register("email")} error={signupForm.formState.errors.email?.message} />
                <Input label="Password" type="password" autoComplete="new-password" {...signupForm.register("password")} error={signupForm.formState.errors.password?.message} />
                <Select label="Role" {...signupForm.register("role")} defaultValue="vendor" error={signupForm.formState.errors.role?.message}>
                  <option value="vendor">vendor</option>
                  <option value="user">user</option>
                </Select>

                <Button type="submit" size="lg">
                  Create account
                </Button>
              </form>
            )}
          </div>

          <div className="mt-4 px-4 pb-4 text-xs text-zinc-500">
            Tip: After login, try the <span className="font-semibold">{action === "login" ? "UPI Parser" : "UPI Parser"}</span> page and paste sample UPI SMS messages.
          </div>
        </Card>
      </div>
    </div>
  );
}

