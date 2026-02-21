"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

const sectors = ["Restaurant", "Agency", "Clinic", "Construction", "Retail", "Other"];
const employeeBands = ["1-5", "6-15", "16-30", "31-50", "50+"];
const frequencies = ["Weekly", "Biweekly", "Monthly"];
const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    business_name: "The Cobblestone Kitchen",
    sector: "restaurant",
    employee_count: 8,
    payroll_amount: 840000,
    payroll_frequency: "biweekly",
    payroll_day: "friday",
  });

  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    const run = async () => {
      const url = new URL(window.location.href);
      if (url.searchParams.get("step") === "syncing") {
        setStep(4);
      }
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        await supabase.auth.signInAnonymously();
      }
    };
    run();
  }, [supabase]);

  async function savePartial(partial: Partial<typeof form>) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    const payload = { ...form, ...partial };
    setForm(payload);
    await supabase.from("accounts").upsert({
      user_id: user.id,
      ...payload,
      monzo_connected: false,
      onboarding_complete: false,
    });
  }

  const syncSteps = [
    "Connecting to Monzo...",
    "Syncing 90 days of transactions...",
    "Claude is building your cashflow model...",
    "Calculating payroll risk...",
    "Your Float dashboard is ready.",
  ];

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <Card className="w-full max-w-2xl">
        <CardContent className="p-8">
          <div className="mb-8">
            <div className="mb-3 h-2 overflow-hidden rounded-full bg-secondary">
              <div className="h-full bg-primary transition-all duration-500" style={{ width: `${(step / 4) * 100}%` }} />
            </div>
          </div>

          {step === 1 && (
            <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-6 text-center">
              <div className="mx-auto h-16 w-16 rounded-2xl bg-primary/20" />
              <h1 className="text-3xl font-bold">Welcome to Float</h1>
              <p className="text-muted-foreground">Your AI CFO is ready. Let&apos;s set up your account in 60 seconds.</p>
              <Button size="lg" onClick={() => setStep(2)}>
                Get Started
              </Button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
              <h2 className="text-2xl font-semibold">Business Details</h2>
              <Input
                value={form.business_name}
                placeholder="The Cobblestone Kitchen"
                onChange={(e) => savePartial({ business_name: e.target.value })}
              />

              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">What sector are you in?</p>
                <div className="flex flex-wrap gap-2">
                  {sectors.map((sector) => (
                    <Button
                      key={sector}
                      variant={form.sector === sector.toLowerCase() ? "default" : "outline"}
                      onClick={() => savePartial({ sector: sector.toLowerCase() })}
                    >
                      {sector}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">How many employees do you have?</p>
                <div className="flex flex-wrap gap-2">
                  {employeeBands.map((band) => (
                    <Button
                      key={band}
                      variant={
                        (form.employee_count <= 5 && band === "1-5") ||
                        (form.employee_count > 5 && form.employee_count <= 15 && band === "6-15") ||
                        (form.employee_count > 15 && form.employee_count <= 30 && band === "16-30") ||
                        (form.employee_count > 30 && form.employee_count <= 50 && band === "31-50") ||
                        (form.employee_count > 50 && band === "50+")
                          ? "default"
                          : "outline"
                      }
                      onClick={() => {
                        const value = band === "50+" ? 55 : Number(band.split("-")[0]);
                        savePartial({ employee_count: value });
                      }}
                    >
                      {band}
                    </Button>
                  ))}
                </div>
              </div>

              <Input
                type="number"
                value={Math.round(form.payroll_amount / 100)}
                onChange={(e) => savePartial({ payroll_amount: Number(e.target.value || 0) * 100 })}
                placeholder="8400"
              />

              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Payroll frequency</p>
                <div className="flex flex-wrap gap-2">
                  {frequencies.map((frequency) => (
                    <Button
                      key={frequency}
                      variant={form.payroll_frequency === frequency.toLowerCase() ? "default" : "outline"}
                      onClick={() => savePartial({ payroll_frequency: frequency.toLowerCase() })}
                    >
                      {frequency}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Payroll day</p>
                <div className="flex flex-wrap gap-2">
                  {days.map((day) => (
                    <Button
                      key={day}
                      variant={form.payroll_day === day.toLowerCase() ? "default" : "outline"}
                      onClick={() => savePartial({ payroll_day: day.toLowerCase() })}
                    >
                      {day}
                    </Button>
                  ))}
                </div>
              </div>

              <Button onClick={() => setStep(3)}>Continue</Button>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-5 text-center">
              <div className="mx-auto h-16 w-16 rounded-full bg-[#ff6d5a]/20" />
              <h2 className="text-2xl font-semibold">Connect your Monzo account</h2>
              <p className="text-sm text-muted-foreground">
                Float needs read-only access to your transactions and balance. We never store your credentials.
              </p>
              <ul className="mx-auto max-w-md space-y-2 text-left text-sm text-muted-foreground">
                <li>- Read-only access - we can never move your money</li>
                <li>- Encrypted and stored securely in Supabase</li>
                <li>- Disconnect anytime from your Monzo app</li>
              </ul>
              <Button
                size="lg"
                className="bg-[#ff6d5a] hover:bg-[#ff6d5a]/90"
                onClick={() => {
                  setLoading(true);
                  window.location.href = "/api/monzo/auth";
                }}
              >
                {loading ? "Redirecting..." : "Connect Monzo"}
              </Button>
              <Button variant="ghost" onClick={() => setStep(4)}>
                Skip for demo
              </Button>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5 text-center">
              <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-400" />
              <h2 className="text-2xl font-semibold">Syncing your data</h2>
              <div className="space-y-2 text-left">
                {syncSteps.map((item, idx) => (
                  <motion.div key={item} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.2 }} className="rounded-md border border-border/70 bg-card/70 px-3 py-2 text-sm">
                    {item}
                  </motion.div>
                ))}
              </div>
              <Button
                size="lg"
                onClick={async () => {
                  const {
                    data: { user },
                  } = await supabase.auth.getUser();
                  if (user) {
                    await supabase.from("accounts").update({ onboarding_complete: true }).eq("user_id", user.id);
                  }
                  router.push("/dashboard");
                }}
              >
                Enter Dashboard
              </Button>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
