import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Loader2,
  LogOut,
  AlertTriangle,
  Search,
  Filter,
  MapPin,
  ShieldAlert,
  Ban,
  Bell,
  Snowflake,
  FileCheck2,
  ChevronRight,
  Activity,
  Layers,
  Building2,
  Truck,
  Calendar,
  Tag,
  Barcode,
  ArrowLeft,
  Rocket,
  CheckCircle2,
  XCircle,
  PlusCircle,
  ListChecks,
  ShieldOff,
  GitBranch,
  Check,
} from "lucide-react";
import mowaridiLogo from "@/assets/mowaridi-logo.png";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";

export const Route = createFileRoute("/recall")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Recall Workspace · Mowaridi" },
      {
        name: "description",
        content:
          "Operational recall command center — trace procurement exposure, restrict products and launch recalls in minutes.",
      },
    ],
  }),
  component: RecallWorkspacePage,
});

const CORAL = "oklch(0.68 0.18 38)";
const ESPRESSO = "oklch(0.28 0.05 40)";
const COCOA = "oklch(0.55 0.08 45)";
const CRITICAL = "oklch(0.58 0.22 25)";
const WARN = "oklch(0.72 0.18 60)";

type Severity = "Critical" | "High" | "Medium" | "Informational";
type Scope = "SKU" | "Brand" | "Batch" | "Seller" | "Supplier";

type ExposureRow = {
  id: string;
  buyer: string;
  type: "Kitchen" | "Hotel" | "Restaurant" | "Caterer";
  sku: string;
  brand: string;
  batch: string;
  qty: number;
  est: number;
  delivered: string;
  supplier: string;
  seller: string;
  region: string;
  status: "Active" | "Recalled";
  ack: boolean;
};

const ALL_ROWS: ExposureRow[] = [
  { id: "r1", buyer: "Ajyad Central Kitchen", type: "Kitchen", sku: "Frozen Chicken Breast 2KG", brand: "Al Baik", batch: "A78421", qty: 500, est: 120, delivered: "2026-05-08", supplier: "ABC Foods", seller: "Tamimi Distribution", region: "Makkah", status: "Active", ack: false },
  { id: "r2", buyer: "Movenpick Hajj Tower", type: "Hotel", sku: "Frozen Chicken Breast 2KG", brand: "Al Baik", batch: "A78421", qty: 320, est: 80, delivered: "2026-05-09", supplier: "ABC Foods", seller: "Tamimi Distribution", region: "Makkah", status: "Active", ack: true },
  { id: "r3", buyer: "Al Tayseer Catering", type: "Caterer", sku: "Frozen Chicken Breast 2KG", brand: "Al Baik", batch: "A78421", qty: 1200, est: 410, delivered: "2026-05-10", supplier: "ABC Foods", seller: "Gulf Cold Chain", region: "Madinah", status: "Active", ack: false },
  { id: "r4", buyer: "Mina Field Kitchen 04", type: "Kitchen", sku: "Frozen Chicken Breast 2KG", brand: "Al Baik", batch: "A78421", qty: 800, est: 260, delivered: "2026-05-11", supplier: "ABC Foods", seller: "Tamimi Distribution", region: "Mina", status: "Active", ack: false },
  { id: "r5", buyer: "Hilton Makkah", type: "Hotel", sku: "Frozen Chicken Breast 2KG", brand: "Al Baik", batch: "A78421", qty: 240, est: 60, delivered: "2026-05-12", supplier: "ABC Foods", seller: "Gulf Cold Chain", region: "Makkah", status: "Active", ack: true },
  { id: "r6", buyer: "Al Baik Restaurant — Aziziyah", type: "Restaurant", sku: "Frozen Chicken Breast 2KG", brand: "Al Baik", batch: "A78421", qty: 180, est: 30, delivered: "2026-05-13", supplier: "ABC Foods", seller: "Tamimi Distribution", region: "Makkah", status: "Active", ack: false },
  { id: "r7", buyer: "Arafat Mass Catering", type: "Caterer", sku: "Frozen Chicken Breast 2KG", brand: "Al Baik", batch: "A78421", qty: 1500, est: 520, delivered: "2026-05-14", supplier: "ABC Foods", seller: "Gulf Cold Chain", region: "Arafat", status: "Active", ack: false },
];

const TIMELINE = [
  { d: "May 01", v: 0 }, { d: "May 03", v: 320 }, { d: "May 05", v: 540 },
  { d: "May 08", v: 820 }, { d: "May 10", v: 1200 }, { d: "May 12", v: 1500 }, { d: "May 14", v: 1500 },
];

function RecallWorkspacePage() {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const [email, setEmail] = useState<string | null>(null);

  // View: landing actions vs traceability builder
  const [view, setView] = useState<"landing" | "builder">("landing");

  // Filters
  const [category, setCategory] = useState("Frozen Protein");
  const [brand, setBrand] = useState("Al Baik");
  const [sku, setSku] = useState("Frozen Chicken Breast 2KG");
  const [batch, setBatch] = useState("A78421");
  const [expiry, setExpiry] = useState("2026-09-15");
  const [supplier, setSupplier] = useState("ABC Foods");
  const [region, setRegion] = useState<string>("All");
  const [severity, setSeverity] = useState<Severity>("Critical");
  const [scope, setScope] = useState<Scope>("Batch");
  const [from, setFrom] = useState("2026-05-01");
  const [to, setTo] = useState("2026-05-14");
  const [shippedFrom, setShippedFrom] = useState("2026-04-28");
  const [shippedTo, setShippedTo] = useState("2026-05-13");

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [showLaunch, setShowLaunch] = useState(false);
  const [launched, setLaunched] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) navigate({ to: "/login" });
      else {
        setEmail(data.session.user.email ?? null);
        setChecking(false);
      }
    });
  }, [navigate]);

  const rows = useMemo(
    () =>
      ALL_ROWS.filter((r) =>
        (brand === "" || r.brand === brand) &&
        (sku === "" || r.sku === sku) &&
        (batch === "" || r.batch === batch) &&
        (supplier === "" || r.supplier === supplier) &&
        (region === "All" || r.region === region) &&
        r.delivered >= from &&
        r.delivered <= to
      ),
    [brand, sku, batch, supplier, region, from, to]
  );

  const impacted = rows.length;
  const totalQty = rows.reduce((a, r) => a + r.qty, 0);
  const remaining = rows.reduce((a, r) => a + r.est, 0);
  const regions = new Set(rows.map((r) => r.region)).size;
  const invoiceValue = totalQty * 38; // SAR per KG mock

  const distribution = useMemo(() => {
    const map: Record<string, number> = {};
    rows.forEach((r) => (map[r.type] = (map[r.type] ?? 0) + r.qty));
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [rows]);

  const regionData = useMemo(() => {
    const map: Record<string, number> = {};
    rows.forEach((r) => (map[r.region] = (map[r.region] ?? 0) + r.qty));
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [rows]);

  const toggle = (id: string) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  };
  const toggleAll = () => {
    if (selected.size === rows.length) setSelected(new Set());
    else setSelected(new Set(rows.map((r) => r.id)));
  };

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

  const sevColor =
    severity === "Critical" ? CRITICAL : severity === "High" ? WARN : severity === "Medium" ? "oklch(0.75 0.16 90)" : "oklch(0.6 0.12 240)";

  return (
    <main className="min-h-screen w-full" style={{ background: "var(--mow-cream)", color: ESPRESSO }}>
      {/* Header */}
      <header
        className="sticky top-0 z-30 border-b backdrop-blur"
        style={{ background: "oklch(1 0 0 / 0.75)", borderColor: "oklch(0.55 0.1 40 / 0.15)" }}
      >
        <div className="mx-auto flex max-w-[1700px] items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate({ to: "/" })}
              className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs hover:bg-black/5"
              style={{ color: COCOA }}
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Dashboard
            </button>
            <img src={mowaridiLogo} alt="Mowaridi" className="h-9 w-9 object-contain" />
            <div className="flex flex-col leading-tight">
              <h1 className="text-base font-semibold tracking-tight">Recall Workspace</h1>
              <span className="text-[11px]" style={{ color: COCOA }}>
                Operational Recall Command Center · {new Date().toLocaleString()}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium"
              style={{ background: `${sevColor.replace(")", " / 0.12)")}`, color: sevColor }}
            >
              <AlertTriangle className="h-3 w-3" /> Severity: {severity}
            </span>
            <div
              className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs"
              style={{ background: "oklch(0.95 0.04 160)", color: "oklch(0.45 0.15 160)" }}
            >
              <span className="h-1.5 w-1.5 animate-pulse rounded-full" style={{ background: "oklch(0.6 0.18 160)" }} />
              Live trace
            </div>
            {email && <span className="hidden text-xs sm:inline" style={{ color: COCOA }}>{email}</span>}
            <button
              onClick={handleSignOut}
              className="inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-medium hover:scale-[1.02]"
              style={{ borderColor: "oklch(0.55 0.1 40 / 0.25)", color: ESPRESSO }}
            >
              <LogOut className="h-3.5 w-3.5" /> Sign out
            </button>
          </div>
        </div>

      </header>

      {view === "landing" ? (
        <LandingActions
          onCreate={() => setView("builder")}
        />
      ) : (
      <>
      {/* Back to actions */}
      <div className="mx-auto max-w-[1700px] px-4 pt-4">
        <button
          onClick={() => setView("landing")}
          className="inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs hover:bg-black/5"
          style={{ borderColor: "oklch(0.55 0.1 40 / 0.25)", color: COCOA }}
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Recall Center
        </button>
      </div>
      {/* 3-panel layout */}
      <div className="mx-auto grid max-w-[1600px] grid-cols-1 gap-4 px-4 py-5 lg:grid-cols-[300px_minmax(0,1fr)_260px]">
        {/* LEFT — Filters */}
        <aside className="space-y-3">
          <Panel icon={<Filter className="h-4 w-4" />} title="Recall Filters" caption="Live trace updates instantly">
            <Group title="Product Filters" icon={<Tag className="h-3 w-3" />}>
              <Field label="Category" value={category} onChange={setCategory} options={["Frozen Protein", "Dairy", "Produce", "Beverage", "Bakery"]} />
              <Field label="Brand" value={brand} onChange={setBrand} options={["Al Baik", "Americana", "Almarai", "Nadec"]} />
              <Field label="SKU" value={sku} onChange={setSku} options={["Frozen Chicken Breast 2KG", "Whole Chicken 1.2KG", "Beef Mince 1KG"]} />
              <Field label="Batch / Lot Number" value={batch} onChange={setBatch} icon={<Barcode className="h-3 w-3" />} />
              <Field label="Expiry Date" value={expiry} onChange={setExpiry} type="date" />
            </Group>

            <Group title="Supplier Filters" icon={<Building2 className="h-3 w-3" />}>
              <Field label="Supplier" value={supplier} onChange={setSupplier} options={["ABC Foods", "Gulf Provisions", "Hijaz Trading"]} />
            </Group>

            <Group title="Procurement Filters" icon={<Truck className="h-3 w-3" />}>
              <div className="grid grid-cols-2 gap-2">
                <Field label="Delivered from" value={from} onChange={setFrom} type="date" />
                <Field label="Delivered to" value={to} onChange={setTo} type="date" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Field label="Shipped from" value={shippedFrom} onChange={setShippedFrom} type="date" />
                <Field label="Shipped to" value={shippedTo} onChange={setShippedTo} type="date" />
              </div>
            </Group>

            <Group title="Buyer Filters" icon={<MapPin className="h-3 w-3" />}>
              <Field
                label="Region"
                value={region}
                onChange={setRegion}
                options={["All", "Makkah", "Madinah", "Mina", "Arafat"]}
              />
            </Group>

            <Group title="Severity & Scope" icon={<ShieldAlert className="h-3 w-3" />}>
              <div className="flex flex-wrap gap-1.5">
                {(["Critical", "High", "Medium", "Informational"] as Severity[]).map((s) => (
                  <button
                    key={s}
                    onClick={() => setSeverity(s)}
                    className="rounded-full border px-2 py-0.5 text-[10px] font-medium transition"
                    style={
                      severity === s
                        ? { background: CRITICAL, color: "white", borderColor: CRITICAL }
                        : { borderColor: "oklch(0.55 0.1 40 / 0.25)", color: COCOA }
                    }
                  >
                    {s}
                  </button>
                ))}
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {(["SKU", "Brand", "Batch", "Seller", "Supplier"] as Scope[]).map((s) => (
                  <button
                    key={s}
                    onClick={() => setScope(s)}
                    className="rounded-md border px-2 py-0.5 text-[10px] font-medium"
                    style={
                      scope === s
                        ? { background: ESPRESSO, color: "white", borderColor: ESPRESSO }
                        : { borderColor: "oklch(0.55 0.1 40 / 0.25)", color: COCOA }
                    }
                  >
                    {s} Recall
                  </button>
                ))}
              </div>
            </Group>
          </Panel>
        </aside>

        {/* CENTER — Impact */}
        <section className="space-y-4">
          {/* KPI cards */}
          <div className="grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-6">
            <Kpi label="Impacted buyers" value={impacted.toString()} />
            <Kpi label="Total orders" value={impacted.toString()} />
            <Kpi label="Total quantity (KG)" value={totalQty.toLocaleString()} />
            <Kpi label="Invoice value" value={`SAR ${invoiceValue.toLocaleString()}`} />
            <Kpi label="Active inventory (KG)" value={remaining.toLocaleString()} accent />
            <Kpi label="Regions impacted" value={regions.toString()} />
          </div>

          {/* Trace breadcrumb */}
          <Panel icon={<Activity className="h-4 w-4" />} title="Live trace" caption="Filters → exposure recomputes on every change">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <Pill>{brand}</Pill>
              <Pill>{sku}</Pill>
              <Pill>Batch {batch}</Pill>
              <Pill>{supplier}</Pill>
              <Pill>
                {from} → {to}
              </Pill>
            </div>
          </Panel>

          {/* Charts grid */}
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <Panel icon={<MapPin className="h-4 w-4" />} title="Geographic exposure" caption="Quantity (KG) by region">
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={regionData} margin={{ left: -20, right: 8, top: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.55 0.1 40 / 0.15)" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="value" fill={CORAL} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Panel>

            <Panel icon={<Layers className="h-4 w-4" />} title="Buyer distribution" caption="Type · KG">
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Tooltip />
                  <Pie data={distribution} dataKey="value" innerRadius={45} outerRadius={70} paddingAngle={2}>
                    {distribution.map((_, i) => (
                      <Cell key={i} fill={[CORAL, "oklch(0.55 0.12 250)", "oklch(0.65 0.15 160)", "oklch(0.72 0.16 80)"][i % 4]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </Panel>

            <Panel icon={<Calendar className="h-4 w-4" />} title="Procurement timeline" caption="Cumulative exposure">
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={TIMELINE} margin={{ left: -20, right: 8, top: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.55 0.1 40 / 0.15)" />
                  <XAxis dataKey="d" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="v" stroke={CRITICAL} strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </Panel>
          </div>

          {/* Exposure Table */}
          <Panel icon={<Search className="h-4 w-4" />} title="Buyer exposure" caption={`${rows.length} buyers · ${selected.size} selected`}>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <button
                onClick={() => setSelected(new Set(rows.map((r) => r.id)))}
                className="rounded-md border px-2 py-1 text-[11px]"
                style={{ borderColor: "oklch(0.55 0.1 40 / 0.25)" }}
              >
                Select all
              </button>
              <button
                onClick={() => setSelected(new Set(rows.filter((r) => r.region === "Makkah").map((r) => r.id)))}
                className="rounded-md border px-2 py-1 text-[11px]"
                style={{ borderColor: "oklch(0.55 0.1 40 / 0.25)" }}
              >
                Select region: Makkah
              </button>
              <button
                onClick={() => setSelected(new Set(rows.filter((r) => r.supplier === supplier).map((r) => r.id)))}
                className="rounded-md border px-2 py-1 text-[11px]"
                style={{ borderColor: "oklch(0.55 0.1 40 / 0.25)" }}
              >
                Select supplier
              </button>
              <span className="ml-auto text-[11px]" style={{ color: COCOA }}>
                Est. remaining inventory in-field: <b style={{ color: CRITICAL }}>{remaining.toLocaleString()} KG</b>
              </span>
            </div>

            <div className="overflow-x-auto rounded-lg border" style={{ borderColor: "oklch(0.55 0.1 40 / 0.15)" }}>
              <table className="w-full text-xs">
                <thead style={{ background: "oklch(0.97 0.02 60)" }}>
                  <tr className="text-left" style={{ color: COCOA }}>
                    <th className="px-2 py-2">
                      <input type="checkbox" checked={selected.size === rows.length && rows.length > 0} onChange={toggleAll} />
                    </th>
                    <th className="px-2 py-2">Buyer</th>
                    <th className="px-2 py-2">Type</th>
                    <th className="px-2 py-2">Batch</th>
                    <th className="px-2 py-2 text-right">Qty (KG)</th>
                    <th className="px-2 py-2 text-right">Est. left</th>
                    <th className="px-2 py-2">Delivered</th>
                    <th className="px-2 py-2">Region</th>
                    <th className="px-2 py-2">Status</th>
                    <th className="px-2 py-2">Ack</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr
                      key={r.id}
                      className="border-t transition hover:bg-black/[0.02]"
                      style={{ borderColor: "oklch(0.55 0.1 40 / 0.12)" }}
                    >
                      <td className="px-2 py-2">
                        <input type="checkbox" checked={selected.has(r.id)} onChange={() => toggle(r.id)} />
                      </td>
                      <td className="px-2 py-2 font-medium">{r.buyer}</td>
                      <td className="px-2 py-2">{r.type}</td>
                      <td className="px-2 py-2 font-mono text-[10px]">{r.batch}</td>
                      <td className="px-2 py-2 text-right">{r.qty}</td>
                      <td className="px-2 py-2 text-right font-semibold" style={{ color: CRITICAL }}>{r.est}</td>
                      <td className="px-2 py-2">{r.delivered}</td>
                      <td className="px-2 py-2">{r.region}</td>
                      <td className="px-2 py-2">
                        <span
                          className="rounded-full px-2 py-0.5 text-[10px] font-medium"
                          style={
                            r.status === "Active"
                              ? { background: "oklch(0.95 0.05 60)", color: WARN }
                              : { background: "oklch(0.95 0.05 25)", color: CRITICAL }
                          }
                        >
                          {r.status}
                        </span>
                      </td>
                      <td className="px-2 py-2">
                        {r.ack ? (
                          <CheckCircle2 className="h-3.5 w-3.5" style={{ color: "oklch(0.6 0.16 160)" }} />
                        ) : (
                          <XCircle className="h-3.5 w-3.5" style={{ color: COCOA }} />
                        )}
                      </td>
                    </tr>
                  ))}
                  {rows.length === 0 && (
                    <tr>
                      <td colSpan={10} className="px-2 py-6 text-center" style={{ color: COCOA }}>
                        No exposure found for current filters
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Panel>
        </section>

        {/* RIGHT — Actions */}
        <aside className="space-y-3 lg:sticky lg:top-[120px] lg:self-start">
          <Panel icon={<Ban className="h-4 w-4" />} title="Restriction actions">
            <ActionBtn>Restrict SKU</ActionBtn>
            <ActionBtn>Restrict Brand</ActionBtn>
            <ActionBtn>Restrict Supplier</ActionBtn>
          </Panel>

          <Panel icon={<Bell className="h-4 w-4" />} title="Recall actions">
            <ActionBtn>Notify Buyers &amp; Sellers</ActionBtn>
          </Panel>

          <Panel icon={<Snowflake className="h-4 w-4" />} title="Inventory actions">
            <ActionBtn>Freeze Inventory</ActionBtn>
            <ActionBtn>Flag Active Orders</ActionBtn>
          </Panel>


          <button
            onClick={() => setShowLaunch(true)}
            className="group flex w-full items-center justify-center gap-2 rounded-xl px-3 py-3 text-sm font-semibold text-white shadow-lg transition hover:scale-[1.02]"
            style={{
              background: `linear-gradient(135deg, ${CRITICAL}, ${CORAL})`,
              boxShadow: `0 10px 30px -10px ${CRITICAL.replace(")", " / 0.5)")}`,
            }}
          >
            <Rocket className="h-4 w-4 transition group-hover:rotate-12" />
            Launch Recall
          </button>
        </aside>
      </div>
      </>
      )}


      {/* Launch Modal */}
      {showLaunch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm" onClick={() => setShowLaunch(false)}>
          <div
            className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {!launched ? (
              <>
                <div className="mb-4 flex items-center gap-3">
                  <div className="rounded-lg p-2" style={{ background: `${CRITICAL.replace(")", " / 0.12)")}`, color: CRITICAL }}>
                    <AlertTriangle className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold">Confirm recall launch</h2>
                    <p className="text-xs" style={{ color: COCOA }}>This action will trigger live restrictions across the platform.</p>
                  </div>
                </div>
                <dl className="mb-5 grid grid-cols-2 gap-x-4 gap-y-2 rounded-lg p-3 text-sm" style={{ background: "oklch(0.97 0.02 60)" }}>
                  <Row k="Affected entities" v={impacted.toString()} />
                  <Row k="Affected SKUs" v="1" />
                  <Row k="Estimated exposure" v={`${remaining} KG`} />
                  <Row k="Regions impacted" v={regions.toString()} />
                  <Row k="Severity" v={severity} />
                  <Row k="Scope" v={`${scope} recall`} />
                </dl>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setShowLaunch(false)}
                    className="rounded-md border px-3 py-1.5 text-sm"
                    style={{ borderColor: "oklch(0.55 0.1 40 / 0.25)" }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => setLaunched(true)}
                    className="rounded-md px-3 py-1.5 text-sm font-semibold text-white"
                    style={{ background: CRITICAL }}
                  >
                    Launch Recall
                  </button>
                </div>
              </>
            ) : (
              <div className="py-4 text-center">
                <div className="mx-auto mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full" style={{ background: "oklch(0.95 0.06 160)", color: "oklch(0.5 0.16 160)" }}>
                  <CheckCircle2 className="h-7 w-7" />
                </div>
                <h2 className="text-lg font-semibold">Recall launched</h2>
                <p className="mb-4 text-sm" style={{ color: COCOA }}>
                  Buyers notified · inventory frozen · compliance case opened.
                </p>
                <button
                  onClick={() => {
                    setShowLaunch(false);
                    setLaunched(false);
                  }}
                  className="rounded-md px-4 py-2 text-sm font-semibold text-white"
                  style={{ background: ESPRESSO }}
                >
                  Back to workspace
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}

/* ---------- helpers ---------- */

function Panel({ title, caption, icon, children }: { title: string; caption?: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div
      className="rounded-xl border bg-white p-3"
      style={{ borderColor: "oklch(0.55 0.1 40 / 0.15)", boxShadow: "0 1px 2px oklch(0.3 0.05 40 / 0.04)" }}
    >
      <div className="mb-2 flex items-center gap-2">
        {icon && <span style={{ color: CORAL }}>{icon}</span>}
        <h3 className="text-sm font-semibold">{title}</h3>
        {caption && <span className="ml-auto text-[10px]" style={{ color: COCOA }}>{caption}</span>}
      </div>
      <div>{children}</div>
    </div>
  );
}

function Group({ title, icon, children }: { title: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="mb-3 last:mb-0">
      <div className="mb-1.5 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider" style={{ color: COCOA }}>
        {icon}
        {title}
      </div>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  options,
  type,
  icon,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options?: string[];
  type?: string;
  icon?: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-0.5 flex items-center gap-1 text-[10px]" style={{ color: COCOA }}>
        {icon}
        {label}
      </span>
      {options ? (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-md border bg-white px-2 py-1 text-xs outline-none focus:ring-2"
          style={{ borderColor: "oklch(0.55 0.1 40 / 0.25)" }}
        >
          {options.map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
      ) : (
        <input
          type={type ?? "text"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-md border bg-white px-2 py-1 text-xs outline-none focus:ring-2"
          style={{ borderColor: "oklch(0.55 0.1 40 / 0.25)" }}
        />
      )}
    </label>
  );
}

function Kpi({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div
      className="rounded-xl border bg-white p-3"
      style={{
        borderColor: accent ? CRITICAL.replace(")", " / 0.35)") : "oklch(0.55 0.1 40 / 0.15)",
        background: accent ? `linear-gradient(135deg, white, ${CRITICAL.replace(")", " / 0.06)")})` : "white",
      }}
    >
      <div className="text-[10px] uppercase tracking-wider" style={{ color: COCOA }}>{label}</div>
      <div className="mt-0.5 text-lg font-semibold tracking-tight" style={{ color: accent ? CRITICAL : ESPRESSO }}>{value}</div>
    </div>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="rounded-full px-2 py-0.5 text-[10px] font-medium"
      style={{ background: "oklch(0.96 0.03 60)", color: ESPRESSO, border: "1px solid oklch(0.55 0.1 40 / 0.18)" }}
    >
      {children}
    </span>
  );
}

function ActionBtn({ children }: { children: React.ReactNode }) {
  const [on, setOn] = useState(false);
  return (
    <button
      type="button"
      onClick={() => setOn((v) => !v)}
      aria-pressed={on}
      className="mb-1.5 flex w-full items-center gap-2 rounded-md border px-2.5 py-1.5 text-[11px] font-medium transition last:mb-0 hover:bg-black/[0.03]"
      style={
        on
          ? { borderColor: CORAL, background: "oklch(0.68 0.18 38 / 0.12)", color: ESPRESSO }
          : { borderColor: "oklch(0.55 0.1 40 / 0.2)", color: ESPRESSO }
      }
    >
      <span
        className="grid h-3.5 w-3.5 place-content-center rounded-[3px] border"
        style={{
          borderColor: on ? CORAL : "oklch(0.55 0.1 40 / 0.35)",
          background: on ? CORAL : "transparent",
        }}
      >
        {on && <Check className="h-2.5 w-2.5 text-white" />}
      </span>
      <span className="text-left">{children}</span>
    </button>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <>
      <dt className="text-[11px]" style={{ color: COCOA }}>{k}</dt>
      <dd className="text-right text-sm font-semibold">{v}</dd>
    </>
  );
}

function LandingActions({ onCreate }: { onCreate: () => void }) {
  const tiles = [
    {
      title: "Create Recall",
      desc: "Start a new traceability-driven recall in minutes.",
      icon: <PlusCircle className="h-5 w-5" />,
      tone: "primary" as const,
      onClick: onCreate,
      cta: "Start builder",
    },
    {
      title: "Active Recalls",
      desc: "Monitor recalls currently in progress across the platform.",
      icon: <ListChecks className="h-5 w-5" />,
      badge: "3 live",
    },
    {
      title: "Restricted Products",
      desc: "Browse SKUs, brands and suppliers under restriction.",
      icon: <ShieldOff className="h-5 w-5" />,
      badge: "12",
    },
    {
      title: "Traceability Search",
      desc: "Ad-hoc trace by batch, supplier, buyer or region.",
      icon: <GitBranch className="h-5 w-5" />,
    },
  ];
  return (
    <div className="mx-auto max-w-[1700px] px-4 py-8">
      <div className="mb-6">
        <h2 className="text-xl font-semibold tracking-tight">Recall Center</h2>
        <p className="mt-1 text-sm" style={{ color: COCOA }}>
          Choose an action to begin. Create Recall opens the Traceability Recall Builder.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {tiles.map((t) => {
          const isPrimary = t.tone === "primary";
          return (
            <button
              key={t.title}
              onClick={t.onClick}
              className="group flex h-full flex-col items-start gap-3 rounded-2xl border bg-white p-5 text-left transition hover:-translate-y-0.5 hover:shadow-lg"
              style={{
                borderColor: isPrimary ? CORAL.replace(")", " / 0.4)") : "oklch(0.55 0.1 40 / 0.15)",
                background: isPrimary
                  ? `linear-gradient(135deg, white, ${CORAL.replace(")", " / 0.08)")})`
                  : "white",
              }}
            >
              <div
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl"
                style={{
                  background: isPrimary ? CORAL : "oklch(0.96 0.03 60)",
                  color: isPrimary ? "white" : CORAL,
                }}
              >
                {t.icon}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-semibold tracking-tight">{t.title}</h3>
                  {t.badge && (
                    <span
                      className="rounded-full px-2 py-0.5 text-[10px] font-medium"
                      style={{ background: "oklch(0.95 0.05 25)", color: CRITICAL }}
                    >
                      {t.badge}
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs leading-relaxed" style={{ color: COCOA }}>
                  {t.desc}
                </p>
              </div>
              <span
                className="inline-flex items-center gap-1 text-xs font-medium transition group-hover:gap-2"
                style={{ color: isPrimary ? CORAL : ESPRESSO }}
              >
                {t.cta ?? "Open"} <ChevronRight className="h-3 w-3" />
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

