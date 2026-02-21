"use client";

import { useEffect, useState } from "react";
import {
  Bell,
  ChevronDown,
  CircleHelp,
  LayoutGrid,
  Link2,
  ListTodo,
  Plus,
  Search,
  Settings,
  Share2,
  Wallet,
  Zap,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const mortgageData = [
  { name: "On Hold", value: 2, color: "#f3b12b" },
  { name: "In Progress", value: 12, color: "#8f8df9" },
  { name: "Approved Loans", value: 6, color: "#2bd67b" },
];

const weekBars = [
  { day: "Mo", uv: 4.2, pv: 2.8 },
  { day: "Tu", uv: 3.2, pv: 2.2 },
  { day: "We", uv: 2.3, pv: 1.3 },
  { day: "Th", uv: 5.4, pv: 4.5 },
  { day: "Fr", uv: 4.2, pv: 3.3 },
  { day: "Sa", uv: 6.0, pv: 4.1 },
];

const trendData = [
  { x: "Jan", generated: 120, preApproval: 80, contacts: 58, progress: 95, closed: 18 },
  { x: "Feb", generated: 210, preApproval: 136, contacts: 70, progress: 130, closed: 26 },
  { x: "Mar", generated: 220, preApproval: 145, contacts: 84, progress: 160, closed: 34 },
  { x: "Apr", generated: 280, preApproval: 180, contacts: 110, progress: 190, closed: 42 },
  { x: "May", generated: 300, preApproval: 220, contacts: 130, progress: 250, closed: 55 },
  { x: "Jun", generated: 340, preApproval: 250, contacts: 160, progress: 280, closed: 62 },
];

const navItems = [
  { label: "Overview", icon: LayoutGrid, active: true },
  { label: "Deals", icon: Wallet, active: false, hasChevron: true },
  { label: "Integration", icon: Link2, active: false },
  { label: "Tasks", icon: ListTodo, active: false },
];

function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 hidden h-screen w-[250px] border-r border-[#2a2c31] bg-[#17191f] lg:flex lg:flex-col">
      <div className="flex items-center gap-2 px-6 py-6">
        <div className="text-lg font-semibold tracking-wide text-[#f2f4f8]">Plan</div>
      </div>

      <div className="px-4">
        <button className="absolute -right-3 top-24 hidden h-6 w-6 items-center justify-center rounded-full border border-[#3a3d45] bg-[#1b1d23] text-[#9ca1ad] xl:flex">
          <ChevronDown className="h-3 w-3 -rotate-90" />
        </button>
        <nav className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                className={`flex h-11 w-full items-center gap-3 rounded-lg px-4 text-sm transition-colors ${
                  item.active
                    ? "bg-[#5b43ff] text-white"
                    : "text-[#9ca1ad] hover:bg-[#23262d] hover:text-[#f0f3f8]"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
                {item.hasChevron ? <ChevronDown className="ml-auto h-4 w-4" /> : null}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto border-t border-[#2a2c31] px-4 py-4">
        <button className="mb-2 flex h-10 w-full items-center gap-3 rounded-lg px-4 text-sm text-[#9ca1ad] hover:bg-[#23262d] hover:text-[#f0f3f8]">
          <Settings className="h-4 w-4" />
          Settings
        </button>
        <button className="flex h-10 w-full items-center gap-3 rounded-lg px-4 text-sm text-[#9ca1ad] hover:bg-[#23262d] hover:text-[#f0f3f8]">
          <CircleHelp className="h-4 w-4" />
          Help & Support
          <span className="ml-auto rounded-sm bg-[#f4ba2a] px-1.5 py-0.5 text-[10px] font-semibold text-black">
            8
          </span>
        </button>
      </div>
    </aside>
  );
}

function Topbar() {
  return (
    <header className="sticky top-0 z-10 border-b border-[#2a2c31] bg-[#17191f]/95 backdrop-blur">
      <div className="flex h-[68px] items-center justify-between px-4 lg:px-7">
        <div className="w-full max-w-[460px]">
          <div className="flex h-11 items-center gap-3 rounded-md border border-[#2a2c31] bg-[#1d2026] px-4 text-[#8d93a0]">
            <Search className="h-4 w-4" />
            <span className="text-sm">Search or type a command</span>
          </div>
        </div>

        <div className="ml-4 flex items-center gap-4 text-[#9aa0ad]">
          <Zap className="h-4 w-4" />
          <div className="relative">
            <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-[#ff8f43]" />
            <span className="text-sm">+</span>
          </div>
          <Bell className="h-4 w-4" />
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-[#ffa15e] to-[#cb4f43]" />
            <ChevronDown className="h-4 w-4" />
          </div>
        </div>
      </div>
    </header>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[#2a2c31] bg-[#1a1d23] px-6 py-7">
      <p className="text-center text-[31px] leading-none tracking-tight text-[#f2f4f8]">{value}</p>
      <p className="mt-3 text-center text-sm text-[#a3a9b6]">{label}</p>
    </div>
  );
}

export function ReferenceDashboard() {
  const [mounted, setMounted] = useState(false);
  const total = mortgageData.reduce((sum, item) => sum + item.value, 0);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen bg-[#13151a] text-[#eef1f6]">
      <Sidebar />
      <div className="lg:ml-[250px]">
        <Topbar />

        <main className="px-4 pb-8 pt-5 lg:px-7">
          <div className="mb-3 text-sm text-[#9fa5b2]">Thursday, 20th February</div>

          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-5xl font-semibold tracking-tight text-[#f1f4fa]">Good Evening! John,</h1>
            <div className="flex gap-2">
              <button className="inline-flex items-center gap-2 rounded-md border border-[#31353d] bg-[#1e2128] px-3 py-2 text-sm text-[#cfd3dc]">
                <Share2 className="h-4 w-4" />
                Share
              </button>
              <button className="inline-flex items-center gap-2 rounded-md border border-[#31353d] bg-[#1e2128] px-3 py-2 text-sm text-[#cfd3dc]">
                <Plus className="h-4 w-4" />
                Add New
              </button>
            </div>
          </div>

          <section className="grid gap-4 md:grid-cols-3">
            <StatCard label="Total Approved" value="18" />
            <StatCard label="Total Submissions" value="32" />
            <StatCard label="Loan In-progress" value="07" />
          </section>

          <section className="mt-4 grid gap-4 xl:grid-cols-2">
            <div className="rounded-xl border border-[#2a2c31] bg-[#1a1d23] p-4">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-[29px] font-medium text-[#f2f4f8]">Mortgage Data</h2>
                <button className="inline-flex items-center gap-1 rounded-md border border-[#30343c] bg-[#1f232a] px-3 py-1.5 text-xs text-[#a3a9b6]">
                  This Week
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="grid items-center gap-4 md:grid-cols-[220px_1fr]">
                <div className="h-[220px]">
                  {mounted ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={mortgageData}
                          dataKey="value"
                          innerRadius={62}
                          outerRadius={82}
                          paddingAngle={4}
                          stroke="#1a1d23"
                        >
                          {mortgageData.map((entry) => (
                            <Cell key={entry.name} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full w-full" />
                  )}
                </div>

                <div className="-mt-2">
                  <div className="mb-4 text-center md:text-left">
                    <div className="text-5xl font-semibold leading-none text-[#f4f7fd]">18</div>
                    <div className="mt-1 text-xs tracking-wider text-[#8c92a0]">OUT OF {total}</div>
                  </div>

                  <div className="space-y-3">
                    {mortgageData.map((item) => (
                      <div key={item.name} className="flex items-center justify-between gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: item.color }} />
                          <span className="text-[#d8dce5]">{item.value}</span>
                        </div>
                        <span className="text-[#9fa5b2]">{item.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-[#2a2c31] bg-[#1a1d23] p-4">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-[29px] font-medium text-[#f2f4f8]">Loan Approved</h2>
                <button className="inline-flex items-center gap-1 rounded-md border border-[#30343c] bg-[#1f232a] px-3 py-1.5 text-xs text-[#a3a9b6]">
                  This Week
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="mb-4 text-6xl font-semibold tracking-tight text-[#f4f7fd]">$9,84,786.50</div>
              <div className="h-[220px]">
                {mounted ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weekBars} barGap={8}>
                      <CartesianGrid stroke="#2e323a" vertical={false} />
                      <XAxis dataKey="day" tick={{ fill: "#8f95a2", fontSize: 12 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: "#8f95a2", fontSize: 12 }} axisLine={false} tickLine={false} />
                      <Tooltip
                        cursor={{ fill: "#23262d" }}
                        contentStyle={{ background: "#181b21", border: "1px solid #2f333b", borderRadius: 10 }}
                      />
                      <Bar dataKey="uv" fill="#8d84ff" radius={[6, 6, 0, 0]} />
                      <Bar dataKey="pv" fill="#f2b330" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full w-full" />
                )}
              </div>
            </div>
          </section>

          <section className="mt-4 rounded-xl border border-[#2a2c31] bg-[#1a1d23] p-4">
            <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
              <div className="flex gap-10">
                <div>
                  <p className="text-xs text-[#9399a7]">Total Amount</p>
                  <p className="mt-1 text-[44px] font-semibold tracking-tight text-[#f3f6fc]">$225,001.10</p>
                </div>
                <div>
                  <p className="text-xs text-[#9399a7]">Total Deals</p>
                  <p className="mt-1 text-[44px] font-semibold tracking-tight text-[#f3f6fc]">102</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="rounded-md bg-[#313640] px-3 py-1.5 text-xs text-[#eceff4]">Line</button>
                <button className="rounded-md border border-[#343841] px-3 py-1.5 text-xs text-[#a8aebb]">Bar</button>
              </div>
            </div>

            <div className="mb-3 flex flex-wrap items-center gap-5 text-xs">
              <span className="text-[#959baa]">Payment type</span>
              <span className="border-b border-white pb-1 text-white">All</span>
              <span className="text-[#58b5ff]">Loan Generated</span>
              <span className="text-[#a98cff]">Pre-approval Loan</span>
              <span className="text-[#f2b330]">Contacts</span>
              <span className="text-[#35d87d]">In Progress</span>
              <span className="text-[#f36b68]">Loan Closed</span>
            </div>

            <div className="h-[260px]">
              {mounted ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData}>
                    <CartesianGrid stroke="#2d3139" vertical />
                    <XAxis dataKey="x" tick={{ fill: "#8d93a0", fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "#8d93a0", fontSize: 12 }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{ background: "#181b21", border: "1px solid #2f333b", borderRadius: 10 }}
                    />
                    <Area type="monotone" dataKey="progress" stroke="#35d87d" fill="#35d87d44" strokeWidth={2} />
                    <Area type="monotone" dataKey="generated" stroke="#5ea8ff" fill="none" strokeWidth={1.5} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full w-full" />
              )}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
