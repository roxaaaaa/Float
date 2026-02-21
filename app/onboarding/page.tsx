"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, CheckCircle2, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

const sectors = ["Restaurant", "Agency", "Clinic", "Construction", "Retail", "Other"];
const employeeBands = ["1-5", "6-15", "16-30", "31-50", "50+"];
const frequencies = ["Weekly", "Biweekly", "Monthly"];
const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

const syncSteps = [
  "Connecting to Monzo...",
  "Syncing 90 days of transactions...",
  "Claude is building your cashflow model...",
  "Calculating payroll risk...",
  "Your Float dashboard is ready.",
];

type FormState = {
  business_name: string;
  sector: string;
  employee_count: number;
  payroll_amount: number;
  payroll_frequency: string;
  payroll_day: string;
};

function Pill({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-full border px-4 py-2 text-sm transition-all duration-200",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-secondary/30 text-muted-foreground hover:bg-secondary hover:text-foreground",
      )}
    >
      {label}
    </button>
  );
}

export default function OnboardingPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [syncIndex, setSyncIndex] = useState(0);
  const [form, setForm] = useState<FormState>({
    business_name: "The Cobblestone Kitchen",
    sector: "restaurant",
    employee_count: 8,
    payroll_amount: 840000,
    payroll_frequency: "biweekly",
    payroll_day: "friday",
  });

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
    void run();
  }, [supabase]);

  useEffect(() => {
    if (step !== 4) return;
    const timer = setInterval(() => {
      setSyncIndex((prev) => {
        if (prev >= syncSteps.length) return prev;
        return prev + 1;
      });
    }, 950);
    return () => clearInterval(timer);
  }, [step]);

  async function savePartial(partial: Partial<FormState>) {
    const payload = { ...form, ...partial };
    setForm(payload);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("accounts").upsert({
      user_id: user.id,
      ...payload,
      monzo_connected: false,
      onboarding_complete: false,
    });
  }

  const currentQuestionComplete = (() => {
    if (questionIndex === 0) return Boolean(form.business_name.trim());
    if (questionIndex === 1) return Boolean(form.sector);
    if (questionIndex === 2) return form.employee_count > 0;
    if (questionIndex === 3) return form.payroll_amount > 0;
    return Boolean(form.payroll_frequency && form.payroll_day);
  })();

  const detailsProgress = ((questionIndex + 1) / 5) * 100;

  return (
    <div className="hero-glow flex min-h-screen items-center justify-center px-4 py-10">
      <Card className="relative w-full max-w-3xl overflow-hidden border-border/80 bg-[#0b111b]/90">
        <div className="grid-noise absolute inset-0" />
        <CardContent className="relative p-6 md:p-10">
          <div className="mb-8">
            <div className="mb-3 flex items-center justify-between">
              <Badge variant="secondary">Step {step} of 4</Badge>
              {step === 2 && <p className="text-xs text-muted-foreground">Question {questionIndex + 1} of 5</p>}
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full bg-primary transition-all duration-500"
                style={{ width: `${step === 2 ? detailsProgress : (step / 4) * 100}%` }}
              />
            </div>
          </div>

          {step === 1 && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 text-center">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/20 text-3xl font-semibold text-primary">
                F
              </div>
              <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">Welcome to Float</h1>
              <p className="mx-auto max-w-xl text-base text-muted-foreground">
                Your AI CFO is ready. Let&apos;s set up your account in 60 seconds.
              </p>
              <Button size="lg" className="h-12 px-7 text-base" onClick={() => setStep(2)}>
                Get Started
              </Button>
            </motion.div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-semibold tracking-tight">Business details</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  We save each answer in real time to personalize your CFO model.
                </p>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={questionIndex}
                  initial={{ opacity: 0, x: 18 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -18 }}
                  className="rounded-xl border border-border/70 bg-card/40 p-5"
                >
                  {questionIndex === 0 && (
                    <div className="space-y-3">
                      <p className="text-sm font-medium">Business name</p>
                      <Input
                        value={form.business_name}
                        placeholder="The Cobblestone Kitchen"
                        onChange={(e) => void savePartial({ business_name: e.target.value })}
                        className="h-11"
                      />
                    </div>
                  )}

                  {questionIndex === 1 && (
                    <div className="space-y-3">
                      <p className="text-sm font-medium">What sector are you in?</p>
                      <div className="flex flex-wrap gap-2">
                        {sectors.map((sector) => (
                          <Pill
                            key={sector}
                            label={sector}
                            active={form.sector === sector.toLowerCase()}
                            onClick={() => void savePartial({ sector: sector.toLowerCase() })}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {questionIndex === 2 && (
                    <div className="space-y-3">
                      <p className="text-sm font-medium">How many employees do you have?</p>
                      <div className="flex flex-wrap gap-2">
                        {employeeBands.map((band) => (
                          <Pill
                            key={band}
                            label={band}
                            active={
                              (form.employee_count <= 5 && band === "1-5") ||
                              (form.employee_count > 5 && form.employee_count <= 15 && band === "6-15") ||
                              (form.employee_count > 15 && form.employee_count <= 30 && band === "16-30") ||
                              (form.employee_count > 30 && form.employee_count <= 50 && band === "31-50") ||
                              (form.employee_count > 50 && band === "50+")
                            }
                            onClick={() => {
                              const value = band === "50+" ? 55 : Number(band.split("-")[0]);
                              void savePartial({ employee_count: value });
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {questionIndex === 3 && (
                    <div className="space-y-3">
                      <p className="text-sm font-medium">What is your approximate monthly payroll?</p>
                      <div className="flex items-center rounded-lg border border-border bg-background px-3">
                        <span className="text-sm text-muted-foreground">EUR</span>
                        <Input
                          type="number"
                          value={Math.round(form.payroll_amount / 100)}
                          onChange={(e) => void savePartial({ payroll_amount: Number(e.target.value || 0) * 100 })}
                          className="h-11 border-0 bg-transparent focus-visible:ring-0"
                        />
                      </div>
                    </div>
                  )}

                  {questionIndex === 4 && (
                    <div className="space-y-4">
                      <p className="text-sm font-medium">When does payroll go out?</p>
                      <div>
                        <p className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">Frequency</p>
                        <div className="flex flex-wrap gap-2">
                          {frequencies.map((frequency) => (
                            <Pill
                              key={frequency}
                              label={frequency}
                              active={form.payroll_frequency === frequency.toLowerCase()}
                              onClick={() => void savePartial({ payroll_frequency: frequency.toLowerCase() })}
                            />
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">Day</p>
                        <div className="flex flex-wrap gap-2">
                          {days.map((day) => (
                            <Pill
                              key={day}
                              label={day}
                              active={form.payroll_day === day.toLowerCase()}
                              onClick={() => void savePartial({ payroll_day: day.toLowerCase() })}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>

              <div className="flex items-center justify-between">
                <Button variant="ghost" onClick={() => setQuestionIndex((prev) => Math.max(0, prev - 1))} disabled={questionIndex === 0}>
                  Back
                </Button>
                <Button
                  onClick={() => {
                    if (!currentQuestionComplete) return;
                    if (questionIndex < 4) {
                      setQuestionIndex((prev) => prev + 1);
                      return;
                    }
                    setStep(3);
                  }}
                  disabled={!currentQuestionComplete}
                >
                  Continue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 text-center">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#ff6d5a]/18 text-xl font-semibold text-[#ff6d5a]">
                M
              </div>
              <div>
                <h2 className="text-3xl font-semibold tracking-tight">Connect your Monzo account</h2>
                <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
                  Float needs read-only access to your transactions and balance. We never store your credentials.
                </p>
              </div>
              <div className="mx-auto max-w-lg rounded-xl border border-border/70 bg-card/40 p-4 text-left">
                <div className="flex items-start gap-3 text-sm text-muted-foreground">
                  <ShieldCheck className="mt-0.5 h-4 w-4 text-primary" />
                  <span>Read-only access, encrypted storage, and instant disconnect from Monzo.</span>
                </div>
              </div>
              <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Button
                  size="lg"
                  className="h-12 bg-[#ff6d5a] px-7 text-base hover:bg-[#ff6d5a]/90"
                  onClick={() => {
                    setLoading(true);
                    window.location.href = "/api/monzo/auth";
                  }}
                >
                  {loading ? "Redirecting..." : "Connect Monzo"}
                </Button>
                <Button variant="ghost" size="lg" className="h-12" onClick={() => setStep(4)}>
                  Skip for Demo
                </Button>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 text-center">
              <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-400" />
              <h2 className="text-3xl font-semibold tracking-tight">Syncing your data</h2>
              <div className="space-y-2 text-left">
                {syncSteps.map((item, idx) => {
                  const done = idx < syncIndex;
                  const active = idx === syncIndex;
                  return (
                    <motion.div
                      key={item}
                      initial={{ opacity: 0, x: 6 }}
                      animate={{ opacity: done || active ? 1 : 0.45, x: 0 }}
                      className={cn(
                        "flex items-center gap-3 rounded-md border px-3 py-2 text-sm",
                        done ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-300" : "border-border/70 bg-card/60",
                      )}
                    >
                      <span className={cn("h-2.5 w-2.5 rounded-full", done ? "bg-emerald-400" : active ? "animate-pulse bg-primary" : "bg-muted")} />
                      {item}
                    </motion.div>
                  );
                })}
              </div>
              {syncIndex >= syncSteps.length && (
                <Button
                  size="lg"
                  className="h-12 px-7 text-base"
                  onClick={async () => {
                    const {
                      data: { user },
                    } = await supabase.auth.getUser();
                    if (user) {
                      await supabase.from("accounts").update({ onboarding_complete: true, monzo_connected: true }).eq("user_id", user.id);
                    }
                    router.push("/dashboard");
                  }}
                >
                  Enter Dashboard
                </Button>
              )}
            </motion.div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
