import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, LogOut, TrendingUp, TrendingDown, ShieldAlert, AlertTriangle } from "lucide-react";
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
  Legend,
} from "recharts";

export const Route = createFileRoute("/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Operations Dashboard · Mowaridi" },
      { name: "description", content: "Mowaridi live operations dashboard — war room, procurement, fulfillment, ecosystem and executive intelligence." },
    ],
  }),
  component: DashboardPage,
});

const CORAL = "oklch(0.68 0.18 38)";
const CORAL_SOFT = "oklch(0.78 0.13 40)";
const ESPRESSO = "oklch(0.28 0.05 40)";
const COCOA = "oklch(0.55 0.08 45)";
const TEAL = "oklch(0.55 0.15 200)";
const GREEN = "oklch(0.55 0.15 160)";
const RED = "oklch(0.55 0.2 25)";

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
      <div className="flex min-h-screen items-center justify-center" style={{ background: "var(--mow-cream)" }}>
        <Loader2 className="h-6 w-6 animate-spin" style={{ color: CORAL }} />
      </div>
    );
  }

  return (
    <main className="min-h-screen w-full" style={{ background: "var(--mow-cream)", color: ESPRESSO }}>
      {/* Header */}
      <header
        className="sticky top-0 z-20 border-b backdrop-blur"
        style={{ background: "oklch(1 0 0 / 0.7)", borderColor: "oklch(0.55 0.1 40 / 0.15)" }}
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
            <button
              onClick={() => navigate({ to: "/recall" })}
              className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-semibold text-white transition hover:scale-[1.02]"
              style={{ background: `linear-gradient(135deg, oklch(0.58 0.22 25), ${CORAL})` }}
            >
              <ShieldAlert className="h-3.5 w-3.5" /> Recall Workspace
            </button>
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
        {/* ===================== SECTION 1 — WAR ROOM OVERVIEW ===================== */}
        <Section title="War Room Overview" caption="​">
          <SubHeading>Live Operations Health</SubHeading>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
            <KpiCard label="Today's GMV" value="SAR 184,920" delta={12.4} spark={sparkUp} />
            <KpiCard label="Today's Orders" value="4,218" delta={5.1} spark={sparkUp} />
            <KpiCard label="Open Shipments" value="1,067" delta={-2.3} spark={sparkDown} />
            <KpiCard label="Fulfillment Rate" value="93.8%" delta={1.2} spark={sparkUp} />
            <KpiCard label="On-Time Delivery" value="87.4%" delta={-0.6} negative spark={sparkDown} />
            <KpiCard label="Vehicles Out for Delivery" value="184" delta={4.0} spark={sparkUp} />
          </div>

          <SubHeading className="mt-6">Marketplace Health</SubHeading>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
            <KpiCard label="Active Users" value="1,842" delta={6.4} spark={sparkUp} />
            <KpiCard label="Active Suppliers" value="312" delta={2.1} spark={sparkUp} />
            <KpiCard label="AOV Today" value="SAR 43.85" delta={3.7} spark={sparkUp} />
            <KpiCard label="Cancellation Rate" value="6.2%" delta={1.4} negative spark={sparkDown} />
            <KpiCard label="Repeat Purchase Rate" value="42.8%" delta={2.6} spark={sparkUp} />
            <KpiCard label="Promo Usage Today" value="528" delta={9.1} spark={sparkUp} />
          </div>

          <SubHeading className="mt-6">Procurement Transparency</SubHeading>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
            <KpiCard label="Total Disclosures" value="2,184" delta={8.2} spark={sparkUp} />
            <KpiCard label="Invoices Disclosed" value="1,962" delta={7.4} spark={sparkUp} />
            <KpiCard label="Value Disclosed" value="SAR 4.82M" delta={11.6} spark={sparkUp} />
            <KpiCard label="Disclosure : Invoice Ratio" value="89.8%" delta={1.4} spark={sparkUp} />
            <KpiCard label="Suppliers (Disclosed)" value="248" delta={3.0} spark={sparkUp} />
            <KpiCard label="Customers (Disclosed)" value="612" delta={5.2} spark={sparkUp} />
          </div>
        </Section>

        {/* ===================== SECTION 2 — LIVE OPERATIONS MONITORING ===================== */}
        <Section title="Live Operations Monitoring" caption="Real-time operational visibility">
          <SubHeading>Live Open Orders by Status</SubHeading>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <StatTile label="New" value="320" />
            <StatTile label="Confirmed" value="280" />
            <StatTile label="Waiting for Pickup" value="240" />
            <StatTile label="Out for Delivery" value="412" />
          </div>

          <SubHeading className="mt-6">Weekly Order Funnel · Last 4 Weeks &amp; Channel Split</SubHeading>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Card title="Weekly orders — last 4 weeks (W-4 → W-1)">
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={weeklyFunnel} barCategoryGap="25%">
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.55 0.1 40 / 0.15)" />
                  <XAxis dataKey="week" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="Delivered" stackId="a" fill={TEAL} />
                  <Bar dataKey="In Flight" stackId="a" fill="oklch(0.70 0.13 230)" />
                  <Bar dataKey="Cancelled" stackId="a" fill={CORAL} radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
            <Card title="Channel Split — Web / iOS / Android">
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Pie
                    data={[
                      { name: "Web", value: 1820 },
                      { name: "iOS", value: 1480 },
                      { name: "Android", value: 918 },
                    ]}
                    innerRadius={50}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                    label={{ fontSize: 11 }}
                  >
                    {PALETTE.slice(0, 3).map((c, i) => <Cell key={i} fill={c} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </div>



          <SubHeading className="mt-6">Live Trend Monitoring</SubHeading>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Card title="GMV — 14-Day Trend (GMV vs Delivered GMV / NMV)">
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={gmvDualTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.55 0.1 40 / 0.15)" />
                  <XAxis dataKey="d" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Line type="monotone" name="GMV" dataKey="gmv" stroke={CORAL} strokeWidth={2} dot={{ r: 2 }} />
                  <Line type="monotone" name="Delivered GMV (NMV)" dataKey="nmv" stroke={TEAL} strokeWidth={2} dot={{ r: 2 }} />
                </LineChart>
              </ResponsiveContainer>
            </Card>
            <Card title="AOV — 14-Day Trend (AOV vs Delivered AOV)">
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={aovDualTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.55 0.1 40 / 0.15)" />
                  <XAxis dataKey="d" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Line type="monotone" name="AOV" dataKey="aov" stroke={CORAL} strokeWidth={2} dot={{ r: 2 }} />
                  <Line type="monotone" name="Delivered AOV" dataKey="daov" stroke={GREEN} strokeWidth={2} dot={{ r: 2 }} />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </div>

          <SubHeading className="mt-6">Operational Latency Monitoring</SubHeading>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <StatTile label="Supplier Confirmation Latency" value="18 min" sub="avg today" />
            <StatTile label="Avg Time-to-Deliver from Pickup" value="42 min" sub="vs 14d avg 44 min" />
            <StatTile label="Order Lead Time" value="1h 28m" sub="created → delivered" />
            <StatTile label="Open Shipments" value="1,067" sub="in transit" />
          </div>
        </Section>

        {/* ===================== SECTION 3 — PROCUREMENT & ORDER INTELLIGENCE ===================== */}
        <Section title="Procurement & Order Intelligence" caption="Marketplace transaction performance">
          <SubHeading>Procurement KPIs</SubHeading>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
            <StatTile label="Total Orders" value="4,218" />
            <StatTile label="GMV" value="SAR 184,920" />
            <StatTile label="Delivered GMV (NMV)" value="SAR 162,480" />
            <StatTile label="AOV" value="SAR 43.85" />
            <StatTile label="Delivered AOV" value="SAR 41.20" />
            <StatTile label="COD / PP Ratio (Value)" value="38% / 62%" />
            <StatTile label="Fulfillment Option Mix" value="71% / 29%" sub="supplier / pickup" />
            <StatTile label="Fulfillment Rate" value="93.8%" />
            <StatTile label="On-Time Delivery" value="87.4%" />
          </div>

          <SubHeading className="mt-6">Cancellation Intelligence</SubHeading>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <StatTile label="Total Cancelled Orders" value="262" accent />
            <StatTile label="Cancelled GMV" value="SAR 11,840" accent />
            <StatTile label="Customer Cancellations (Value)" value="SAR 7,420" />
            <StatTile label="Supplier Cancellations (Value)" value="SAR 4,420" />
          </div>

          <SubHeading className="mt-6">Cancellation Analytics</SubHeading>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Card title="Cancellation Reasons — Customer">
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={cancelCustomer} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.55 0.1 40 / 0.15)" />
                  <XAxis type="number" tick={{ fontSize: 10 }} />
                  <YAxis type="category" dataKey="name" width={140} tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="v" fill={CORAL} radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
            <Card title="Cancellation Reasons — Supplier">
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={cancelSupplier} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.55 0.1 40 / 0.15)" />
                  <XAxis type="number" tick={{ fontSize: 10 }} />
                  <YAxis type="category" dataKey="name" width={140} tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="v" fill={RED} radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>

          <SubHeading className="mt-6">Channel Intelligence · Channel Split</SubHeading>
          <Card title="Web / iOS / Android">
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Pie
                  data={[
                    { name: "Web", value: 1820 },
                    { name: "iOS", value: 1480 },
                    { name: "Android", value: 918 },
                  ]}
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                  label={{ fontSize: 11 }}
                >
                  {PALETTE.slice(0, 3).map((c, i) => <Cell key={i} fill={c} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Section>

        {/* ===================== SECTION 4 — DELIVERY & FULFILLMENT INTELLIGENCE ===================== */}
        <Section title="Delivery & Fulfillment Intelligence" caption="Logistics efficiency and delivery operations">
          <SubHeading>Delivery KPIs</SubHeading>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
            <StatTile label="Vehicles Out for Delivery" value="184" />
            <StatTile label="Waiting for Pickup Orders" value="240" />
            <StatTile label="Avg Pickup-to-Delivery" value="42 min" />
            <StatTile label="Supplier Confirmation Latency" value="18 min" />
            <StatTile label="Order Lead Time" value="1h 28m" />
            <StatTile label="Open Shipments" value="1,067" />
          </div>

          <SubHeading className="mt-6">Fulfillment Intelligence · Fulfillment Option Mix</SubHeading>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Card title="Supplier Delivery vs Self Pickup">
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Pie
                    data={[
                      { name: "Supplier Delivery", value: 71 },
                      { name: "Self Pickup", value: 29 },
                    ]}
                    innerRadius={60}
                    outerRadius={100}
                    dataKey="value"
                    label={{ fontSize: 11 }}
                  >
                    <Cell fill={CORAL} />
                    <Cell fill={TEAL} />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </Card>
            <Card title="Supplier Geography — Makkah vs Outside Makkah">
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={[
                  { name: "Makkah", v: 142 },
                  { name: "Outside Makkah", v: 170 },
                ]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.55 0.1 40 / 0.15)" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="v" fill={CORAL} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>
        </Section>

        {/* ===================== SECTION 5 — MARKETPLACE ECOSYSTEM INTELLIGENCE ===================== */}
        <Section title="Marketplace Ecosystem Intelligence" caption="Platform growth and ecosystem participation">
          <SubHeading>User Intelligence</SubHeading>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
            <StatTile label="Total Users" value="12,840" />
            <StatTile label="Verified Users" value="9,612" />
            <StatTile label="Unverified Users" value="3,228" accent />
            <StatTile label="Active Users" value="1,842" />
            <StatTile label="Repeat Purchase Rate" value="42.8%" />
            <StatTile label="Promo Usage Today" value="528" />
          </div>

          <SubHeading className="mt-6">Supplier Ecosystem Intelligence</SubHeading>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            <StatTile label="Total Suppliers" value="612" />
            <StatTile label="Active Suppliers" value="312" />
            <StatTile label="Total Supplier Referrals" value="48" />
          </div>

          <SubHeading className="mt-6">Top Marketplace Participants</SubHeading>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            <Card title="Top 4 Suppliers (Value)">
              <DataTable
                columns={["#", "Supplier", "GMV (SAR)"]}
                rows={[
                  ["1", "Almarai", "48,200"],
                  ["2", "Sadia", "38,400"],
                  ["3", "Nadec", "31,200"],
                  ["4", "Goody", "24,800"],
                ]}
              />
            </Card>
            <Card title="Top 4 Customers (Value)">
              <DataTable
                columns={["#", "Customer", "GMV (SAR)"]}
                rows={[
                  ["1", "Almarai Co", "42,180"],
                  ["2", "Panda Express", "34,920"],
                  ["3", "Tamimi Markets", "28,640"],
                  ["4", "Bin Dawood", "22,140"],
                ]}
              />
            </Card>
            <Card title="Top Branches by GMV">
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={topBranches.slice(0, 6)} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.55 0.1 40 / 0.15)" />
                  <XAxis type="number" tick={{ fontSize: 10 }} />
                  <YAxis type="category" dataKey="name" width={130} tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="gmv" fill={PALETTE[1]} radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>
        </Section>

        {/* ===================== SECTION 6 — PRODUCT & CATEGORY INTELLIGENCE ===================== */}
        <Section title="Product & Category Intelligence" caption="Product movement and procurement trends">
          <SubHeading>Product Intelligence</SubHeading>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Card title="Top Categories (Value)">
              <DataTable columns={["#", "Category", "GMV"]} rows={[
                ["1", "Dairy", "62,180"],
                ["2", "Beverages", "48,420"],
                ["3", "Frozen", "32,140"],
                ["4", "Bakery", "24,820"],
                ["5", "Snacks", "18,640"],
              ]} />
            </Card>
            <Card title="Top Subcategories (Value)">
              <DataTable columns={["#", "Subcategory", "GMV"]} rows={[
                ["1", "Fresh Milk", "28,420"],
                ["2", "Juices", "22,140"],
                ["3", "Frozen Chicken", "18,820"],
                ["4", "Yoghurt", "14,640"],
                ["5", "Soft Drinks", "12,180"],
              ]} />
            </Card>
            <Card title="Top Products (Value)">
              <DataTable columns={["#", "Product", "GMV"]} rows={[
                ["1", "Almarai Full Cream 1L", "18,200"],
                ["2", "Nadec Juice 1L", "14,840"],
                ["3", "Sadia Chicken 1.2kg", "12,640"],
                ["4", "Goody Tuna 185g", "9,420"],
                ["5", "AlSafi Yoghurt 170g", "7,180"],
              ]} />
            </Card>
            <Card title="Top Brands (Value)">
              <DataTable columns={["#", "Brand", "GMV"]} rows={[
                ["1", "Almarai", "62,400"],
                ["2", "Nadec", "38,200"],
                ["3", "Sadia", "32,140"],
                ["4", "Goody", "21,640"],
                ["5", "AlSafi", "16,820"],
              ]} />
            </Card>
          </div>

          <SubHeading className="mt-6">Demand Intelligence</SubHeading>
          <div
            className="rounded-2xl border p-5 shadow-sm"
            style={{
              background: "linear-gradient(135deg, oklch(0.96 0.06 40), oklch(1 0 0))",
              borderColor: "oklch(0.55 0.2 25 / 0.35)",
            }}
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full" style={{ background: "oklch(0.95 0.05 25)" }}>
                  <AlertTriangle className="h-6 w-6" style={{ color: RED }} />
                </div>
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: RED }}>
                    Unmet Demand Signal
                  </div>
                  <div className="text-sm font-medium" style={{ color: ESPRESSO }}>
                    Unavailable Item Requests Today
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold" style={{ color: RED }}>84</div>
                <div className="text-[11px]" style={{ color: COCOA }}>requests · review for sourcing</div>
              </div>
            </div>
          </div>
        </Section>

        {/* ===================== SECTION 7 — INVOICE DISCLOSURE & TRANSPARENCY ===================== */}
        <Section title="Procurement Transparency Command Center" caption="Invoice disclosure & transparency monitoring">
          <SubHeading>Disclosure KPIs</SubHeading>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
            <StatTile label="Total Disclosures" value="2,184" />
            <StatTile label="Invoices Disclosed" value="1,962" />
            <StatTile label="Value Disclosed" value="SAR 4.82M" />
            <StatTile label="Disclosure : Invoice Ratio" value="89.8%" />
            <StatTile label="Suppliers (Disclosed)" value="248" />
            <StatTile label="Customers (Disclosed)" value="612" />
          </div>

          <SubHeading className="mt-6">Disclosure Trends</SubHeading>
          <Card title="Disclosures · Invoice Count · Invoice Value">
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={disclosureTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.55 0.1 40 / 0.15)" />
                <XAxis dataKey="d" tick={{ fontSize: 10 }} />
                <YAxis yAxisId="left" tick={{ fontSize: 10 }} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line yAxisId="left" type="monotone" name="Disclosures" dataKey="disclosures" stroke={CORAL} strokeWidth={2} dot={{ r: 2 }} />
                <Line yAxisId="left" type="monotone" name="Invoice Count" dataKey="invoices" stroke={TEAL} strokeWidth={2} dot={{ r: 2 }} />
                <Line yAxisId="right" type="monotone" name="Invoice Value (SAR k)" dataKey="value" stroke={GREEN} strokeWidth={2} dot={{ r: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          <SubHeading className="mt-6">Disclosure Product Intelligence</SubHeading>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Card title="Top Categories — Invoices Disclosed">
              <DataTable columns={["#", "Category", "Value"]} rows={[
                ["1", "Dairy", "1.42M"],
                ["2", "Beverages", "0.98M"],
                ["3", "Frozen", "0.72M"],
                ["4", "Bakery", "0.48M"],
              ]} />
            </Card>
            <Card title="Top Subcategories — Invoices Disclosed">
              <DataTable columns={["#", "Subcategory", "Value"]} rows={[
                ["1", "Fresh Milk", "0.64M"],
                ["2", "Juices", "0.48M"],
                ["3", "Frozen Chicken", "0.38M"],
                ["4", "Yoghurt", "0.32M"],
              ]} />
            </Card>
            <Card title="Top Products — Invoices Disclosed">
              <DataTable columns={["#", "Product", "Value"]} rows={[
                ["1", "Almarai Full Cream 1L", "0.42M"],
                ["2", "Nadec Juice 1L", "0.32M"],
                ["3", "Sadia Chicken 1.2kg", "0.28M"],
                ["4", "Goody Tuna 185g", "0.21M"],
              ]} />
            </Card>
            <Card title="Top Brands — Invoices Disclosed">
              <DataTable columns={["#", "Brand", "Value"]} rows={[
                ["1", "Almarai", "1.42M"],
                ["2", "Nadec", "0.84M"],
                ["3", "Sadia", "0.72M"],
                ["4", "Goody", "0.48M"],
              ]} />
            </Card>
          </div>
        </Section>

        {/* ===================== SECTION 8 — GEOGRAPHIC INTELLIGENCE ===================== */}
        <Section title="Geographic Intelligence" caption="Regional procurement and logistics visibility">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <MapCard title="Pickup Locations Map" total="142" label="Total Pickup Locations" tone={CORAL} />
            <MapCard title="Delivery Locations Map" total="2,184" label="Total Delivery Locations" tone={TEAL} />
          </div>

          <SubHeading className="mt-6">District Intelligence · Top Districts by GMV (Customer Areas)</SubHeading>
          <Card title="Heatmap — Top Districts">
            <div className="grid grid-cols-2 gap-2 md:grid-cols-4 xl:grid-cols-7">
              {topDistricts.map((d) => {
                const intensity = d.v / topDistricts[0].v;
                return (
                  <div
                    key={d.name}
                    className="flex flex-col gap-1 rounded-xl p-3"
                    style={{
                      background: `oklch(0.68 ${0.06 + intensity * 0.14} 38 / ${0.18 + intensity * 0.6})`,
                      color: intensity > 0.6 ? "white" : ESPRESSO,
                    }}
                  >
                    <span className="text-[10px] font-semibold uppercase tracking-wider opacity-80">{d.name}</span>
                    <span className="text-lg font-bold">SAR {d.v.toLocaleString()}</span>
                  </div>
                );
              })}
            </div>
          </Card>
        </Section>

        {/* ===================== SECTION 9 — EXECUTIVE INTELLIGENCE ===================== */}
        <Section title="Executive Intelligence" caption="Leadership-level strategic monitoring">
          <SubHeading>Executive KPIs</SubHeading>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <KpiCard label="Today vs Yesterday GMV" value="SAR 184,920" delta={12.4} spark={sparkUp} />
            <KpiCard label="GMV Growth %" value="+12.4%" delta={12.4} spark={sparkUp} />
            <KpiCard label="Delivery Efficiency" value="87.4%" delta={1.2} spark={sparkUp} />
            <KpiCard label="Procurement Velocity" value="1.42x" delta={4.8} spark={sparkUp} />
          </div>

          <SubHeading className="mt-6">Strategic Analytics</SubHeading>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Card title="Procurement Trend">
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={procurementTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.55 0.1 40 / 0.15)" />
                  <XAxis dataKey="d" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Area type="monotone" dataKey="v" stroke={CORAL} fill={CORAL_SOFT} fillOpacity={0.35} />
                </AreaChart>
              </ResponsiveContainer>
            </Card>
            <Card title="Supplier Concentration (Top 5 share)">
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={supplierConcentration} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.55 0.1 40 / 0.15)" />
                  <XAxis type="number" tick={{ fontSize: 10 }} />
                  <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="v" fill={TEAL} radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
            <Card title="Buyer Concentration (Top 5 share)">
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={buyerConcentration} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.55 0.1 40 / 0.15)" />
                  <XAxis type="number" tick={{ fontSize: 10 }} />
                  <YAxis type="category" dataKey="name" width={130} tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="v" fill={GREEN} radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
            <Card title="Regional Demand Heatmap">
              <div className="grid grid-cols-3 gap-2">
                {regionalDemand.map((r) => {
                  const intensity = r.v / 100;
                  return (
                    <div
                      key={r.name}
                      className="flex flex-col items-center justify-center rounded-xl p-4"
                      style={{
                        background: `oklch(0.55 ${0.08 + intensity * 0.12} 200 / ${0.2 + intensity * 0.6})`,
                        color: intensity > 0.55 ? "white" : ESPRESSO,
                      }}
                    >
                      <span className="text-[10px] font-semibold uppercase tracking-wider opacity-80">{r.name}</span>
                      <span className="mt-1 text-xl font-bold">{r.v}%</span>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        </Section>
      </div>
    </main>
  );
}

/* ---------- Helpers ---------- */

function Section({ title, caption, children }: { title: string; caption?: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <div className="flex items-end justify-between border-b pb-2" style={{ borderColor: "oklch(0.55 0.1 40 / 0.15)" }}>
        <h2 className="text-sm font-semibold uppercase tracking-[0.18em]" style={{ color: ESPRESSO }}>
          {title}
        </h2>
        {caption && <span className="text-[11px]" style={{ color: COCOA }}>{caption}</span>}
      </div>
      {children}
    </section>
  );
}

function SubHeading({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <h3 className={`text-[11px] font-semibold uppercase tracking-wider ${className}`} style={{ color: COCOA }}>
      {children}
    </h3>
  );
}

function Card({ title, badge, children, className = "" }: { title: string; badge?: string; children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-2xl border p-4 shadow-sm ${className}`}
      style={{ background: "oklch(1 0 0 / 0.85)", borderColor: "oklch(0.55 0.1 40 / 0.15)" }}
    >
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold" style={{ color: ESPRESSO }}>{title}</h3>
        {badge && <span className="text-[10px] font-mono" style={{ color: COCOA }}>{badge}</span>}
      </div>
      {children}
    </div>
  );
}

function MapCard({ title, total, label, tone }: { title: string; total: string; label: string; tone: string }) {
  return (
    <div
      className="relative overflow-hidden rounded-2xl border p-5 shadow-sm"
      style={{ background: "oklch(1 0 0 / 0.85)", borderColor: "oklch(0.55 0.1 40 / 0.15)", minHeight: 220 }}
    >
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `radial-gradient(circle at 20% 30%, ${tone} 1px, transparent 1.5px), radial-gradient(circle at 70% 60%, ${tone} 1px, transparent 1.5px), radial-gradient(circle at 50% 80%, ${tone} 1px, transparent 1.5px), radial-gradient(circle at 85% 20%, ${tone} 1px, transparent 1.5px), radial-gradient(circle at 30% 70%, ${tone} 1px, transparent 1.5px)`,
          backgroundSize: "60px 60px, 80px 80px, 100px 100px, 70px 70px, 90px 90px",
        }}
      />
      <div className="relative">
        <h3 className="text-sm font-semibold" style={{ color: ESPRESSO }}>{title}</h3>
        <div className="mt-8 text-4xl font-bold" style={{ color: tone }}>{total}</div>
        <div className="text-[11px]" style={{ color: COCOA }}>{label}</div>
      </div>
    </div>
  );
}

function KpiCard({ label, value, delta, negative, spark }: { label: string; value: string; delta: number; negative?: boolean; spark: { d: string; v: number }[] }) {
  const isUp = delta >= 0;
  const isGood = negative ? !isUp : isUp;
  const color = isGood ? GREEN : RED;
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
        <span className="text-xl font-bold leading-tight" style={{ color: negative ? RED : ESPRESSO }}>{value}</span>
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
      <div className="mt-1 text-2xl font-bold" style={{ color: accent ? RED : ESPRESSO }}>{value}</div>
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
                if (isLast && lastColAccent) style = { color: RED, fontWeight: 600 };
                if (isStatus) {
                  const ok = cell === "Active";
                  return (
                    <td key={ci} className="py-2">
                      <span className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs"
                        style={{
                          background: ok ? "oklch(0.95 0.05 160)" : "oklch(0.95 0.05 25)",
                          color: ok ? "oklch(0.45 0.15 160)" : RED,
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

const gmvDualTrend = [150, 158, 162, 170, 168, 175, 172, 180, 178, 176, 182, 184, 186, 188].map((v, i) => ({
  d: `D${i + 1}`,
  gmv: v * 1000,
  nmv: Math.round(v * 1000 * (0.84 + Math.sin(i / 3) * 0.03)),
}));

const aovDualTrend = [40, 41, 41.5, 42, 42.8, 43, 43.2, 43.5, 43.8, 44, 44.2, 44.6, 44.9, 45].map((v, i) => ({
  d: `D${i + 1}`,
  aov: v,
  daov: +(v * 0.93).toFixed(2),
}));

const weeklyFunnel = [
  { week: "W-4", Delivered: 14820, Cancelled: 1420 },
  { week: "W-3", Delivered: 15760, Cancelled: 1360 },
  { week: "W-2", Delivered: 16560, Cancelled: 1280 },
  { week: "W-1", Delivered: 14380, Cancelled: 1240, "In Flight": 2800 },

];

const cancelCustomer = [
  { name: "Changed mind", v: 64 },
  { name: "Wrong address", v: 38 },
  { name: "Late delivery", v: 28 },
  { name: "Found cheaper", v: 22 },
  { name: "Payment failed", v: 18 },
  { name: "Other", v: 8 },
];

const cancelSupplier = [
  { name: "Out of stock", v: 92 },
  { name: "Capacity exceeded", v: 36 },
  { name: "Pricing error", v: 22 },
  { name: "Quality issue", v: 14 },
  { name: "Delivery zone", v: 10 },
  { name: "Other", v: 6 },
];

const topBranches = [
  { name: "Riyadh — Olaya", gmv: 28400 },
  { name: "Jeddah — Tahlia", gmv: 24800 },
  { name: "Riyadh — Malaz", gmv: 21200 },
  { name: "Dammam — Corniche", gmv: 18400 },
  { name: "Jeddah — Rawdah", gmv: 16200 },
  { name: "Mecca — Aziziyah", gmv: 14800 },
  { name: "Khobar — North", gmv: 12400 },
  { name: "Medina — Central", gmv: 9200 },
];

const disclosureTrend = Array.from({ length: 14 }, (_, i) => ({
  d: `D${i + 1}`,
  disclosures: 120 + Math.round(Math.sin(i / 2) * 18 + i * 4),
  invoices: 100 + Math.round(Math.cos(i / 2) * 14 + i * 3.5),
  value: 240 + Math.round(Math.sin(i / 3) * 40 + i * 8),
}));

const topDistricts = [
  { name: "Olaya", v: 58000 },
  { name: "Rawdah", v: 46000 },
  { name: "Malaz", v: 38000 },
  { name: "Shati", v: 31000 },
  { name: "Aziziyah", v: 26000 },
  { name: "Corniche", v: 22000 },
  { name: "Tahlia", v: 18000 },
];

const procurementTrend = Array.from({ length: 12 }, (_, i) => ({
  d: `W${i + 1}`,
  v: 120 + Math.round(Math.sin(i / 2) * 15 + i * 6),
}));

const supplierConcentration = [
  { name: "Almarai", v: 26 },
  { name: "Nadec", v: 18 },
  { name: "Sadia", v: 14 },
  { name: "Goody", v: 10 },
  { name: "AlSafi", v: 8 },
];

const buyerConcentration = [
  { name: "Almarai Co", v: 18 },
  { name: "Panda Express", v: 14 },
  { name: "Tamimi Mkt", v: 11 },
  { name: "Bin Dawood", v: 9 },
  { name: "Carrefour", v: 7 },
];

const regionalDemand = [
  { name: "Riyadh", v: 92 },
  { name: "Jeddah", v: 78 },
  { name: "Makkah", v: 64 },
  { name: "Dammam", v: 58 },
  { name: "Medina", v: 44 },
  { name: "Khobar", v: 38 },
  { name: "Taif", v: 28 },
  { name: "Abha", v: 22 },
  { name: "Tabuk", v: 18 },
];
