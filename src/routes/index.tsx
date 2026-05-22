import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, LogOut, TrendingUp, TrendingDown, ShieldAlert } from "lucide-react";
import mowaridiLogo from "@/assets/mowaridi-logo.png";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  FunnelChart,
  Funnel,
  LabelList,
} from "recharts";

export const Route = createFileRoute("/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Operations Dashboard · Mowaridi" },
      { name: "description", content: "Mowaridi live operations dashboard — orders, fulfillment, payments and supplier health." },
    ],
  }),
  component: DashboardPage,
});

const CORAL = "oklch(0.68 0.18 38)";
const CORAL_SOFT = "oklch(0.78 0.13 40)";
const ESPRESSO = "oklch(0.28 0.05 40)";
const COCOA = "oklch(0.55 0.08 45)";

const PALETTE = [
  "oklch(0.68 0.18 38)",
  "oklch(0.55 0.12 250)",
  "oklch(0.65 0.15 160)",
  "oklch(0.72 0.16 80)",
  "oklch(0.6 0.18 300)",
  "oklch(0.55 0.16 20)",
];

function DashboardPage() {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        navigate({ to: "/login" });
      } else {
        setEmail(data.session.user.email ?? null);
        setChecking(false);
      }
    });
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/login" });
  };

  if (checking) {
    return (
      <div
        className="flex min-h-screen items-center justify-center"
        style={{ background: "var(--mow-cream)" }}
      >
        <Loader2 className="h-6 w-6 animate-spin" style={{ color: CORAL }} />
      </div>
    );
  }

  return (
    <main
      className="min-h-screen w-full"
      style={{ background: "var(--mow-cream)", color: ESPRESSO }}
    >
      {/* Header */}
      <header
        className="sticky top-0 z-20 border-b backdrop-blur"
        style={{
          background: "oklch(1 0 0 / 0.7)",
          borderColor: "oklch(0.55 0.1 40 / 0.15)",
        }}
      >
        <div className="mx-auto flex max-w-[1600px] items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            <img src={mowaridiLogo} alt="Mowaridi" className="h-9 w-9 object-contain" />
            <div className="flex flex-col leading-tight">
              <h1 className="text-base font-semibold tracking-tight">Operations Dashboard</h1>
              <span className="text-[11px]" style={{ color: COCOA }}>
                Live · refreshed every 60s · {new Date().toLocaleString()}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs"
              style={{ background: "oklch(0.95 0.04 160)", color: "oklch(0.45 0.15 160)" }}>
              <span className="h-1.5 w-1.5 animate-pulse rounded-full" style={{ background: "oklch(0.6 0.18 160)" }} />
              Live
            </div>
            {email && <span className="hidden text-xs sm:inline" style={{ color: COCOA }}>{email}</span>}
            <button
              onClick={handleSignOut}
              className="inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-medium transition hover:scale-[1.02]"
              style={{ borderColor: "oklch(0.55 0.1 40 / 0.25)", color: ESPRESSO }}
            >
              <LogOut className="h-3.5 w-3.5" /> Sign out
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1600px] space-y-10 px-6 py-8">
        {/* Hero KPIs */}
        <Section title="Hero KPIs" caption="vs same hour yesterday">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 xl:grid-cols-7">
            <KpiCard label="Orders last 60 min" value="342" delta={8.2} spark={sparkUp} />
            <KpiCard label="Today's GMV" value="SAR 184,920" delta={12.4} spark={sparkUp} />
            <KpiCard label="Today's orders" value="4,218" delta={5.1} spark={sparkUp} />
            <KpiCard label="Open shipments" value="1,067" delta={-2.3} spark={sparkDown} />
            <KpiCard label="Payment success rate" value="94.6%" delta={0.8} spark={sparkUp} />
            <KpiCard label="AOV today" value="SAR 43.85" delta={3.7} spark={sparkUp} />
            <KpiCard label="Cancellation rate" value="6.2%" delta={1.4} negative spark={sparkDown} />
          </div>
        </Section>

        {/* Orders & Commerce */}
        <Section title="Orders & Commerce">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Card title="Order funnel today" badge="1.1">
              <ResponsiveContainer width="100%" height={220}>
                <FunnelChart>
                  <Tooltip />
                  <Funnel
                    dataKey="value"
                    data={[
                      { name: "New", value: 4218, fill: "oklch(0.45 0.18 260)" },
                      { name: "Confirmed", value: 3980, fill: "oklch(0.55 0.18 245)" },
                      { name: "Ready for prep", value: 3640, fill: "oklch(0.6 0.16 230)" },
                      { name: "Ready for delivery", value: 3210, fill: "oklch(0.65 0.14 215)" },
                      { name: "On the way", value: 2840, fill: "oklch(0.7 0.13 205)" },
                      { name: "Delivered", value: 2398, fill: "oklch(0.78 0.12 195)" },
                    ]}
                    isAnimationActive
                  >
                    <LabelList position="right" fill={ESPRESSO} stroke="none" dataKey="name" fontSize={11} />
                  </Funnel>
                </FunnelChart>
              </ResponsiveContainer>
            </Card>
            <Card title="Live orders by status" badge="1.2">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Tooltip />
                  <Pie
                    data={[
                      { name: "New", value: 320 },
                      { name: "Confirmed", value: 280 },
                      { name: "Preparing", value: 240 },
                      { name: "Out for delivery", value: 180 },
                      { name: "Delivered", value: 420 },
                      { name: "Cancelled", value: 60 },
                    ]}
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {PALETTE.map((c, i) => <Cell key={i} fill={c} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </Card>
            <Card title="GMV — 14-day trend" badge="1.3">
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={gmvTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.55 0.1 40 / 0.15)" />
                  <XAxis dataKey="d" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="v" stroke={CORAL} strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </Card>
            <Card title="AOV — 14-day trend" badge="1.4">
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={aovTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.55 0.1 40 / 0.15)" />
                  <XAxis dataKey="d" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="v" stroke="oklch(0.55 0.15 160)" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            <Card title="Channel split (web/iOS/Android)" badge="1.5">
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={channelSplit}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.55 0.1 40 / 0.15)" />
                  <XAxis dataKey="h" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="web" stackId="a" fill={PALETTE[1]} />
                  <Bar dataKey="ios" stackId="a" fill={PALETTE[2]} />
                  <Bar dataKey="android" stackId="a" fill={PALETTE[0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
            <Card title="Top branches by GMV today" badge="1.6">
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={topBranches} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.55 0.1 40 / 0.15)" />
                  <XAxis type="number" tick={{ fontSize: 10 }} />
                  <YAxis type="category" dataKey="name" width={130} tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="gmv" fill={PALETTE[1]} radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
            <Card title="Cancellation reasons today" badge="1.7">
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={cancelReasons} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.55 0.1 40 / 0.15)" />
                  <XAxis type="number" tick={{ fontSize: 10 }} />
                  <YAxis type="category" dataKey="name" width={130} tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="v" fill="oklch(0.6 0.2 25)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>
        </Section>

        {/* Delivery & Fulfillment */}
        <Section title="Delivery & Fulfillment">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
            <StatTile label="Picked up" value="142" />
            <StatTile label="In transit" value="318" />
            <StatTile label="Arrived hub" value="96" />
            <StatTile label="Out for delivery" value="412" />
            <StatTile label="Failed attempt" value="47" accent />
          </div>
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            <Card title="On-time delivery rate today" badge="2.2">
              <div className="flex items-end justify-between">
                <span className="text-4xl font-bold" style={{ color: ESPRESSO }}>87.4%</span>
                <span className="text-xs" style={{ color: COCOA }}>target 90%</span>
              </div>
              <div className="mt-4 h-3 w-full rounded-full" style={{ background: "oklch(0.92 0.02 40)" }}>
                <div className="h-3 rounded-full" style={{ width: "87.4%", background: "var(--gradient-brand, oklch(0.68 0.18 38))" }} />
              </div>
            </Card>
            <Card title="Avg time-to-deliver today" badge="2.5">
              <div className="flex items-baseline justify-between">
                <span className="text-4xl font-bold">42 min</span>
                <span className="text-xs" style={{ color: COCOA }}>vs 14d avg 44 min</span>
              </div>
              <ResponsiveContainer width="100%" height={120}>
                <AreaChart data={deliverTime}>
                  <Area type="monotone" dataKey="v" stroke={CORAL} fill={CORAL_SOFT} fillOpacity={0.3} />
                </AreaChart>
              </ResponsiveContainer>
            </Card>
            <Card title="Pickup task health" badge="2.9">
              <div className="flex items-baseline justify-between">
                <span className="text-4xl font-bold" style={{ color: "oklch(0.55 0.2 25)" }}>17</span>
                <span className="text-xs" style={{ color: COCOA }}>of 142 overdue</span>
              </div>
              <ul className="mt-3 space-y-1.5 text-xs" style={{ color: COCOA }}>
                <li className="flex justify-between"><span>PCK-3821 · Olaya</span><span style={{ color: "oklch(0.55 0.2 25)" }}>+18m</span></li>
                <li className="flex justify-between"><span>PCK-3814 · Tahlia</span><span style={{ color: "oklch(0.55 0.2 25)" }}>+14m</span></li>
                <li className="flex justify-between"><span>PCK-3809 · Malaz</span><span style={{ color: "oklch(0.55 0.2 25)" }}>+9m</span></li>
                <li className="flex justify-between"><span>PCK-3802 · Corniche</span><span style={{ color: "oklch(0.55 0.2 25)" }}>+6m</span></li>
              </ul>
            </Card>
          </div>
          <Card title="Late shipments — alerts" badge="2.3" className="mt-4">
            <DataTable
              columns={["Shipment", "Branch", "Customer", "Driver", "Overdue (min)"]}
              rows={[
                ["SHP-48211", "Riyadh — Olaya", "Almarai Co", "Khalid A.", "124"],
                ["SHP-48137", "Jeddah — Tahlia", "Panda Express", "Saeed M.", "92"],
                ["SHP-48092", "Dammam — Corniche", "Tamimi Mkt", "Faisal R.", "78"],
                ["SHP-48065", "Riyadh — Malaz", "Bin Dawood", "Omar Z.", "64"],
                ["SHP-48041", "Mecca — Aziziyah", "LuLu Hyper", "Yousef K.", "41"],
                ["SHP-48022", "Jeddah — Rawdah", "Carrefour", "Hamad S.", "33"],
              ]}
              lastColAccent
            />
          </Card>
        </Section>

        {/* Payments, Refunds & Wallets */}
        <Section title="Payments, Refunds & Wallets">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            <Card title="Payment success rate trend" badge="3.1">
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={paymentSuccess}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.55 0.1 40 / 0.15)" />
                  <XAxis dataKey="d" tick={{ fontSize: 10 }} />
                  <YAxis domain={[85, 100]} tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="v" stroke="oklch(0.55 0.15 160)" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </Card>
            <Card title="Payment status breakdown" badge="3.2">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Tooltip />
                  <Pie
                    data={[
                      { name: "Approved", value: 2840 },
                      { name: "Attempted", value: 320 },
                      { name: "Declined", value: 160 },
                      { name: "Pending 3DS", value: 90 },
                      { name: "Processed", value: 540 },
                      { name: "Not attempted", value: 80 },
                    ]}
                    innerRadius={55}
                    outerRadius={85}
                    dataKey="value"
                    paddingAngle={2}
                  >
                    {PALETTE.map((c, i) => <Cell key={i} fill={c} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </Card>
            <div className="grid grid-cols-1 gap-4">
              <Card title="3DS stuck-in-pending" badge="3.4">
                <div className="flex items-baseline justify-between">
                  <span className="text-5xl font-bold" style={{ color: "oklch(0.55 0.2 60)" }}>23</span>
                  <div className="text-right text-xs" style={{ color: COCOA }}>
                    <div>stuck &gt; 15 min</div>
                    <div>needs investigation</div>
                  </div>
                </div>
              </Card>
              <Card title="Wallet activity today" badge="3.9">
                <div className="flex justify-between text-sm">
                  <div>
                    <div style={{ color: COCOA }} className="text-xs">Transactions</div>
                    <div className="text-2xl font-bold">312</div>
                  </div>
                  <div>
                    <div style={{ color: COCOA }} className="text-xs">Net flow</div>
                    <div className="text-2xl font-bold">SAR 18,420</div>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          <Card title="Declined payments — alerts" badge="3.3" className="mt-4">
            <DataTable
              columns={["Payment", "Customer", "Reason", "Amount (SAR)"]}
              rows={[
                ["PAY-9821", "Modern Trading", "Insufficient funds", "4,820"],
                ["PAY-9817", "Gulf Foods", "Card declined", "3,640"],
                ["PAY-9802", "AlBaik", "Expired card", "2,980"],
                ["PAY-9794", "Herfy", "Limit exceeded", "1,820"],
                ["PAY-9788", "Tamimi Mkt", "Invalid CVV", "1,240"],
              ]}
            />
          </Card>

          <Card title="Payment method performance" badge="3.6" className="mt-4">
            <DataTable
              columns={["#", "Method", "Attempts", "Success %", "GMV"]}
              rows={[
                ["1", "Mada", "1,820", "96.2%", "84,210"],
                ["2", "Visa", "920", "92.4%", "41,840"],
                ["3", "Mastercard", "640", "91.8%", "28,960"],
                ["4", "Apple Pay", "380", "98.1%", "19,420"],
                ["5", "STC Pay", "240", "94.6%", "10,490"],
              ]}
            />
          </Card>
        </Section>

        {/* Suppliers, Branches & Inventory */}
        <Section title="Suppliers, Branches & Inventory">
          <Card title="Top suppliers today" badge="4.1">
            <DataTable
              columns={["#", "Supplier", "Orders", "Fill %", "GMV"]}
              rows={[
                ["1", "Almarai", "412", "96.4%", "48,200"],
                ["2", "Sadia", "318", "94.1%", "38,400"],
                ["3", "Nadec", "284", "91.8%", "31,200"],
                ["4", "Goody", "198", "93.2%", "24,800"],
                ["5", "AlSafi", "162", "89.4%", "19,600"],
                ["6", "Halwani", "124", "92.1%", "14,200"],
              ]}
            />
          </Card>

          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <Card title="Branch availability" badge="4.2">
              <DataTable
                columns={["Branch", "Status", "Reason"]}
                rows={[
                  ["Riyadh — Olaya", "Active", "—"],
                  ["Jeddah — Tahlia", "Active", "—"],
                  ["Riyadh — Malaz", "Inactive", "Staff shortage"],
                  ["Dammam — Corniche", "Active", "—"],
                  ["Jeddah — Rawdah", "Inactive", "Renovation"],
                  ["Mecca — Aziziyah", "Active", "—"],
                  ["Taif — Shifa", "Inactive", "Power outage"],
                ]}
                statusCol={1}
              />
            </Card>
            <Card title="Underperforming branches" badge="4.3">
              <DataTable
                columns={["Branch", "Cancel %", "Confirm lag (min)"]}
                rows={[
                  ["Taif — Shifa", "14.2%", "38"],
                  ["Medina — Central", "11.8%", "29"],
                  ["Khobar — North", "9.4%", "24"],
                ]}
              />
            </Card>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
            <StatTile label="Stockout cancellations" value="142" sub="today" accent />
            <StatTile label="Unavailable item requests" value="84" sub="today" />
            <StatTile label="Open POs (SaryDirect)" value="142" sub="fill rate 91.8%" />
            <StatTile label="Supplier confirm latency" value="18 min" sub="avg today" />
          </div>
        </Section>

        {/* Customers, Promo & Growth */}
        <Section title="Customers, Promo & Growth">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <StatTile label="New customers" value="184" sub="signups today" />
            <StatTile label="Active businesses (DAU)" value="1,842" />
            <StatTile label="Repeat purchase rate" value="42.8%" />
            <StatTile label="Referral signups" value="38" sub="today" />
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <Card title="Business segment mix" badge="5.4">
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Tooltip />
                  <Pie
                    data={[
                      { name: "Restaurants", value: 820 },
                      { name: "Grocery", value: 540 },
                      { name: "Cafes", value: 320 },
                      { name: "Convenience", value: 220 },
                      { name: "Other", value: 140 },
                    ]}
                    outerRadius={90}
                    dataKey="value"
                    label={{ fontSize: 10 }}
                  >
                    {PALETTE.map((c, i) => <Cell key={i} fill={c} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </Card>
            <Card title="Top cities/districts by GMV" badge="5.8">
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={topCities} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.55 0.1 40 / 0.15)" />
                  <XAxis type="number" tick={{ fontSize: 10 }} />
                  <YAxis type="category" dataKey="name" width={130} tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="v" fill={CORAL} radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>

          <Card title="Promo ROI leaderboard" badge="5.6" className="mt-4">
            <DataTable
              columns={["#", "Code", "Uses", "Discount", "GMV influenced", "ROAS"]}
              rows={[
                ["1", "WELCOME20", "184", "4,820", "38,400", "7.97x"],
                ["2", "RAMADAN15", "142", "3,640", "28,960", "7.96x"],
                ["3", "FREESHIP", "98", "1,820", "19,420", "10.67x"],
                ["4", "VIP10", "64", "1,240", "14,200", "11.45x"],
                ["5", "BULK25", "42", "980", "9,800", "10x"],
              ]}
            />
          </Card>
        </Section>

        {/* Quality & Reviews */}
        <Section title="Quality & Reviews">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <StatTile label="CSAT today" value="4.62" sub="out of 5" />
            <StatTile label="Perfect match rate" value="92.4%" sub="of delivered" />
            <StatTile label="Quality check pass rate" value="96.1%" sub="of delivered" />
            <StatTile label="Ready-on-time rate" value="88.7%" sub="of delivered" />
          </div>
          <Card title="Recent ops feedback (low scores)" badge="6.5" className="mt-4">
            <DataTable
              columns={["Feedback", "Branch", "Score", "Comment"]}
              rows={[
                ["FB-2841", "Taif — Shifa", "2/5", "Long wait at pickup"],
                ["FB-2837", "Medina — Central", "2/5", "Items missing from order"],
                ["FB-2832", "Khobar — North", "3/5", "Slow confirmation"],
                ["FB-2828", "Jeddah — Tahlia", "3/5", "Driver communication"],
              ]}
            />
          </Card>
        </Section>
      </div>
    </main>
  );
}

/* ---------- Helpers ---------- */

function Section({ title, caption, children }: { title: string; caption?: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <div className="flex items-end justify-between border-b pb-2"
        style={{ borderColor: "oklch(0.55 0.1 40 / 0.15)" }}>
        <h2 className="text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: COCOA }}>
          {title}
        </h2>
        {caption && <span className="text-[11px]" style={{ color: COCOA }}>{caption}</span>}
      </div>
      {children}
    </section>
  );
}

function Card({ title, badge, children, className = "" }: { title: string; badge?: string; children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-2xl border p-4 shadow-sm ${className}`}
      style={{
        background: "oklch(1 0 0 / 0.85)",
        borderColor: "oklch(0.55 0.1 40 / 0.15)",
      }}
    >
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold" style={{ color: ESPRESSO }}>{title}</h3>
        {badge && <span className="text-[10px] font-mono" style={{ color: COCOA }}>{badge}</span>}
      </div>
      {children}
    </div>
  );
}

function KpiCard({ label, value, delta, negative, spark }: { label: string; value: string; delta: number; negative?: boolean; spark: { d: string; v: number }[] }) {
  const isUp = delta >= 0;
  const isGood = negative ? !isUp : isUp;
  const color = isGood ? "oklch(0.55 0.15 160)" : "oklch(0.55 0.2 25)";
  const Arrow = isUp ? TrendingUp : TrendingDown;
  return (
    <div
      className="flex flex-col rounded-2xl border p-4 shadow-sm"
      style={{
        background: "oklch(1 0 0 / 0.9)",
        borderColor: negative ? "oklch(0.55 0.2 25 / 0.4)" : "oklch(0.55 0.1 40 / 0.15)",
      }}
    >
      <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: COCOA }}>{label}</span>
      <div className="mt-1 flex items-baseline justify-between gap-2">
        <span className="text-xl font-bold leading-tight" style={{ color: negative ? "oklch(0.55 0.2 25)" : ESPRESSO }}>{value}</span>
        <span className="inline-flex items-center gap-0.5 text-[11px] font-medium" style={{ color }}>
          <Arrow className="h-3 w-3" />
          {Math.abs(delta)}%
        </span>
      </div>
      <ResponsiveContainer width="100%" height={36}>
        <AreaChart data={spark}>
          <Area type="monotone" dataKey="v" stroke={color} fill={color} fillOpacity={0.25} strokeWidth={1.5} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function StatTile({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent?: boolean }) {
  return (
    <div
      className="rounded-2xl border p-4 shadow-sm"
      style={{
        background: "oklch(1 0 0 / 0.85)",
        borderColor: accent ? "oklch(0.55 0.2 25 / 0.35)" : "oklch(0.55 0.1 40 / 0.15)",
      }}
    >
      <div className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: COCOA }}>{label}</div>
      <div className="mt-1 text-2xl font-bold" style={{ color: accent ? "oklch(0.55 0.2 25)" : ESPRESSO }}>{value}</div>
      {sub && <div className="text-[11px]" style={{ color: COCOA }}>{sub}</div>}
    </div>
  );
}

function DataTable({ columns, rows, lastColAccent, statusCol }: { columns: string[]; rows: string[][]; lastColAccent?: boolean; statusCol?: number }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr style={{ color: COCOA }}>
            {columns.map((c) => (
              <th key={c} className="border-b py-2 text-left text-[11px] font-semibold uppercase tracking-wider"
                style={{ borderColor: "oklch(0.55 0.1 40 / 0.15)" }}>
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} className="border-b last:border-0" style={{ borderColor: "oklch(0.55 0.1 40 / 0.08)" }}>
              {row.map((cell, ci) => {
                const isLast = ci === row.length - 1;
                const isStatus = statusCol === ci;
                let style: React.CSSProperties = { color: ESPRESSO };
                if (isLast && lastColAccent) style = { color: "oklch(0.55 0.2 25)", fontWeight: 600 };
                if (isStatus) {
                  const ok = cell === "Active";
                  return (
                    <td key={ci} className="py-2">
                      <span className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs"
                        style={{
                          background: ok ? "oklch(0.95 0.05 160)" : "oklch(0.95 0.05 25)",
                          color: ok ? "oklch(0.45 0.15 160)" : "oklch(0.55 0.2 25)",
                        }}>
                        <span className="h-1.5 w-1.5 rounded-full" style={{ background: ok ? "oklch(0.6 0.18 160)" : "oklch(0.6 0.2 25)" }} />
                        {cell}
                      </span>
                    </td>
                  );
                }
                return <td key={ci} className="py-2 text-sm" style={style}>{cell}</td>;
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ---------- Data ---------- */

const sparkUp = Array.from({ length: 14 }, (_, i) => ({ d: `D${i + 1}`, v: 40 + Math.sin(i / 2) * 6 + i * 1.2 }));
const sparkDown = Array.from({ length: 14 }, (_, i) => ({ d: `D${i + 1}`, v: 60 + Math.cos(i / 2) * 6 - i * 0.8 }));

const gmvTrend = [150000, 158000, 162000, 170000, 168000, 175000, 172000, 180000, 178000, 176000, 182000, 184000, 186000, 188000].map((v, i) => ({ d: `D${i + 1}`, v }));
const aovTrend = [40, 41, 41.5, 42, 42.8, 43, 43.2, 43.5, 43.8, 44, 44.2, 44.6, 44.9, 45].map((v, i) => ({ d: `D${i + 1}`, v }));
const deliverTime = [44, 45, 43, 44, 42, 43, 41, 42, 43, 42, 41, 42, 42, 42].map((v, i) => ({ d: `D${i + 1}`, v }));
const paymentSuccess = [92.4, 93.1, 93.8, 94, 93.6, 94.2, 94.5, 94.1, 94.6, 94.8, 94.4, 94.7, 94.6, 94.6].map((v, i) => ({ d: `D${i + 1}`, v }));

const channelSplit = Array.from({ length: 12 }, (_, i) => ({
  h: `${i * 2}:00`,
  web: 80 + Math.round(Math.sin(i / 2) * 30 + 40),
  ios: 90 + Math.round(Math.cos(i / 2) * 30 + 40),
  android: 60 + Math.round(Math.sin(i / 3) * 25 + 30),
}));

const topBranches = [
  { name: "Riyadh — Olaya", gmv: 28400 },
  { name: "Jeddah — Tahlia", gmv: 24800 },
  { name: "Riyadh — Malaz", gmv: 21200 },
  { name: "Dammam — Corniche", gmv: 18400 },
  { name: "Jeddah — Rawdah", gmv: 16200 },
  { name: "Mecca — Aziziyah", gmv: 14800 },
  { name: "Khobar — North", gmv: 12400 },
  { name: "Riyadh — Sulaymaniyah", gmv: 10800 },
  { name: "Medina — Central", gmv: 9200 },
  { name: "Taif — Shifa", gmv: 7400 },
];

const cancelReasons = [
  { name: "Out of stock", v: 92 },
  { name: "Late delivery", v: 64 },
  { name: "Wrong address", v: 38 },
  { name: "Customer changed mind", v: 28 },
  { name: "Payment failed", v: 18 },
  { name: "Duplicate order", v: 12 },
  { name: "Other", v: 8 },
];

const topCities = [
  { name: "Riyadh — Olaya", v: 58000 },
  { name: "Jeddah — Rawdah", v: 46000 },
  { name: "Riyadh — Malaz", v: 38000 },
  { name: "Dammam — Shati", v: 31000 },
  { name: "Mecca — Aziziyah", v: 26000 },
  { name: "Khobar — North", v: 21000 },
  { name: "Medina — Central", v: 16000 },
];
