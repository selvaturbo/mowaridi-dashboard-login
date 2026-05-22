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
type Scope = "SKU" | "Brand" | "Supplier";

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

type BuyerExposure = {
  id: string;
  buyer: string;
  phone: string;
  district: string;
  qty: number;
  totalDeliveries: number;
  totalSuppliers: number;
  latestDelivered: string;
};

const BUYER_EXPOSURE: BuyerExposure[] = [
  { id: "b1", buyer: "Ajyad Central Kitchen", phone: "+966 50 123 4567", district: "Makkah", qty: 500, totalDeliveries: 12, totalSuppliers: 3, latestDelivered: "2026-05-08" },
  { id: "b2", buyer: "Movenpick Hajj Tower", phone: "+966 55 234 5678", district: "Makkah", qty: 320, totalDeliveries: 8, totalSuppliers: 2, latestDelivered: "2026-05-09" },
  { id: "b3", buyer: "Al Tayseer Catering", phone: "+966 56 345 6789", district: "Madinah", qty: 1200, totalDeliveries: 21, totalSuppliers: 4, latestDelivered: "2026-05-10" },
  { id: "b4", buyer: "Mina Field Kitchen 04", phone: "+966 53 456 7890", district: "Mina", qty: 800, totalDeliveries: 15, totalSuppliers: 3, latestDelivered: "2026-05-11" },
  { id: "b5", buyer: "Arafat Mass Catering", phone: "+966 54 567 8901", district: "Arafat", qty: 1500, totalDeliveries: 27, totalSuppliers: 5, latestDelivered: "2026-05-14" },
];

type SupportUpdate = {
  at: string;
  author: string;
  role: string;
  note: string;
};

type ActiveRecall = {
  id: string;
  title: string;
  sku: string;
  brand: string;
  supplier: string;
  batch: string;
  severity: Severity;
  scope: Scope;
  status: "Open" | "Closed";
  launched: string;
  buyersNotified: number;
  buyersAck: number;
  qty: number;
  districts: string[];
  totalCustomers: number;
  totalSuppliers: number;
  totalValue: number;
  brief: string;
  updates: SupportUpdate[];
};

const ACTIVE_RECALLS: ActiveRecall[] = [
  {
    id: "RCL-2026-0142",
    title: "Frozen Chicken Breast — Salmonella suspicion",
    sku: "Frozen Chicken Breast 2KG",
    brand: "Al Baik",
    supplier: "ABC Foods",
    batch: "A78421",
    severity: "Critical",
    scope: "SKU",
    status: "Open",
    launched: "2026-05-14 09:12",
    buyersNotified: 27,
    buyersAck: 18,
    qty: 4740,
    districts: ["Makkah", "Madinah", "Mina", "Arafat"],
    totalCustomers: 27,
    totalSuppliers: 3,
    totalValue: 189600,
    brief:
      "Lab flagged salmonella indicator in batch A78421. All downstream buyers notified, inventories frozen and SKU restricted across all sellers. Awaiting buyer acknowledgements before closing.",
    updates: [
      { at: "2026-05-14 09:20", author: "F. Al Harbi", role: "Recall Lead", note: "Recall launched. Buyer notifications dispatched via SMS + app." },
      { at: "2026-05-14 11:05", author: "Support Desk", role: "L1", note: "8 buyers confirmed quarantine. Following up with remaining 19." },
      { at: "2026-05-15 08:40", author: "QA Team", role: "Lab", note: "Secondary lab sample sent. Results expected within 24h." },
    ],
  },
  {
    id: "RCL-2026-0139",
    title: "Almarai Yoghurt 500g — cold-chain break",
    sku: "Greek Yoghurt 500G",
    brand: "Almarai",
    supplier: "Gulf Cold Chain",
    batch: "Y22014",
    severity: "High",
    scope: "Brand",
    status: "Open",
    launched: "2026-05-11 14:40",
    buyersNotified: 14,
    buyersAck: 12,
    qty: 1820,
    districts: ["Riyadh", "Makkah"],
    totalCustomers: 14,
    totalSuppliers: 2,
    totalValue: 54600,
    brief:
      "Temperature excursion detected in reefer GCC-R12 between Jeddah and Makkah. Brand-level hold in place pending QA disposition.",
    updates: [
      { at: "2026-05-11 15:00", author: "S. Othman", role: "Recall Lead", note: "Reefer GCC-R12 isolated. Brand hold applied." },
      { at: "2026-05-12 10:15", author: "Support Desk", role: "L2", note: "12/14 buyers acknowledged. Two retail buyers pending response." },
    ],
  },
  {
    id: "RCL-2026-0131",
    title: "Hijaz Trading — supplier compliance hold",
    sku: "Multiple",
    brand: "Multiple",
    supplier: "Hijaz Trading",
    batch: "—",
    severity: "Medium",
    scope: "Supplier",
    status: "Closed",
    launched: "2026-05-06 08:25",
    buyersNotified: 9,
    buyersAck: 9,
    qty: 980,
    districts: ["Madinah"],
    totalCustomers: 9,
    totalSuppliers: 1,
    totalValue: 32400,
    brief:
      "Supplier license lapse — purchase orders blocked. All deliveries acknowledged, closing recall after compliance reinstatement on 2026-05-22.",
    updates: [
      { at: "2026-05-06 09:00", author: "R. Khan", role: "Recall Lead", note: "Supplier license lapse confirmed. POs blocked." },
      { at: "2026-05-20 12:30", author: "Compliance", role: "Ops", note: "Reinstatement documents received and verified." },
      { at: "2026-05-22 09:10", author: "R. Khan", role: "Recall Lead", note: "All buyers acknowledged. Recall closed." },
    ],
  },
];


type Restriction = {
  id: string;
  kind: "SKU" | "Brand" | "Supplier";
  name: string;
  context: string;
  effective: string;
  recallId: string;
  incident: string;
};

const RESTRICTIONS: Restriction[] = [
  { id: "rs1", kind: "SKU", name: "Frozen Chicken Breast 2KG", context: "Al Baik · Batch A78421", effective: "2026-05-14", recallId: "RCL-2026-0142", incident: "Salmonella suspicion — lab flagged" },
  { id: "rs2", kind: "SKU", name: "Greek Yoghurt 500G", context: "Almarai · Batch Y22014", effective: "2026-05-11", recallId: "RCL-2026-0139", incident: "Cold-chain break in transit" },
  { id: "rs3", kind: "Brand", name: "Al Baik", context: "All frozen protein SKUs", effective: "2026-05-14", recallId: "RCL-2026-0142", incident: "Brand-wide precautionary hold" },
  { id: "rs4", kind: "Brand", name: "Almarai", context: "Chilled dairy line", effective: "2026-05-11", recallId: "RCL-2026-0139", incident: "Cold-chain break in transit" },
  { id: "rs5", kind: "Supplier", name: "Hijaz Trading", context: "All POs blocked", effective: "2026-05-06", recallId: "RCL-2026-0131", incident: "Supplier license lapse" },
  { id: "rs6", kind: "Supplier", name: "ABC Foods", context: "Frozen protein dispatches", effective: "2026-05-14", recallId: "RCL-2026-0142", incident: "Pending QA disposition" },
];

function RecallWorkspacePage() {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const [email, setEmail] = useState<string | null>(null);

  // View: active recalls (default) · builder · restricted · trace
  const [view, setView] = useState<"active" | "builder" | "restricted" | "trace">("active");

  // Filters
  const [category, setCategory] = useState("Frozen Protein");
  const [brand, setBrand] = useState("Al Baik");
  const [sku, setSku] = useState("Frozen Chicken Breast 2KG");
  const [batch, setBatch] = useState("A78421");
  const [expiry, setExpiry] = useState("2026-09-15");
  const [supplier, setSupplier] = useState("ABC Foods");
  const [region, setRegion] = useState<string>("All");
  const [severity, setSeverity] = useState<Severity>("Critical");
  const [scope, setScope] = useState<Scope | "">("");
  const [from, setFrom] = useState("2026-05-01");
  const [to, setTo] = useState("2026-05-14");
  const [shippedFrom, setShippedFrom] = useState("2026-04-28");
  const [shippedTo, setShippedTo] = useState("2026-05-13");

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [showLaunch, setShowLaunch] = useState(false);
  const [launched, setLaunched] = useState(false);
  const [note, setNote] = useState("");

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
        (supplier === "" || supplier === "All" || r.supplier === supplier) &&
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

      {/* Top action bar — always visible */}
      <div className="mx-auto max-w-[1700px] px-4 pt-4">
        <div
          className="flex flex-wrap items-center gap-2 rounded-xl border bg-white p-2"
          style={{ borderColor: "oklch(0.55 0.1 40 / 0.15)", boxShadow: "0 1px 2px oklch(0.3 0.05 40 / 0.04)" }}
        >
          <TopTab active={view === "active"} onClick={() => setView("active")} icon={<ListChecks className="h-3.5 w-3.5" />} label="Active Recalls" badge="3" />
          <TopTab active={view === "builder"} onClick={() => setView("builder")} icon={<PlusCircle className="h-3.5 w-3.5" />} label="Create Recall" primary />
          <TopTab active={view === "restricted"} onClick={() => setView("restricted")} icon={<ShieldOff className="h-3.5 w-3.5" />} label="Restricted Products" badge={RESTRICTIONS.length.toString()} />
          <TopTab active={view === "trace"} onClick={() => setView("trace")} icon={<GitBranch className="h-3.5 w-3.5" />} label="Traceability Search" />
        </div>
      </div>

      {view === "active" ? (
        <ActiveRecallsView />
      ) : view === "restricted" ? (
        <RestrictedView />
      ) : (
      <>
      {/* 3-panel layout (builder full · trace without right column) */}
      <div
        className={`mx-auto grid max-w-[1600px] grid-cols-1 gap-4 px-4 py-5 ${
          view === "builder" ? "lg:grid-cols-[300px_minmax(0,1fr)_260px]" : "lg:grid-cols-[300px_minmax(0,1fr)]"
        }`}
      >
        {/* LEFT — Filters */}
        <aside className="space-y-3">
          <Panel icon={<Filter className="h-4 w-4" />} title="Recall Filters" caption="Live trace updates instantly">
            <Group title="Product Filters" icon={<Tag className="h-3 w-3" />}>
              <Field label="Category" value={category} onChange={setCategory} options={["Frozen Protein", "Dairy", "Produce", "Beverage", "Bakery"]} />
              <Field label="Brand" value={brand} onChange={setBrand} options={["Al Baik", "Americana", "Almarai", "Nadec"]} />
              <Field label="SKU" value={sku} onChange={setSku} options={["Frozen Chicken Breast 2KG", "Whole Chicken 1.2KG", "Beef Mince 1KG"]} />
              
              <Field label="Expiry Date" value={expiry} onChange={setExpiry} type="date" />
            </Group>

            <Group title="Supplier Filters" icon={<Building2 className="h-3 w-3" />}>
              <Field label="Supplier" value={supplier} onChange={setSupplier} options={["All", "ABC Foods", "Gulf Provisions", "Hijaz Trading"]} />
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
                label="Districts"
                value={region}
                onChange={setRegion}
                options={["All", "Makkah", "Madinah", "Mina", "Arafat"]}
              />
            </Group>

            <Group title="Severity" icon={<ShieldAlert className="h-3 w-3" />}>
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
            </Group>

            <Group title="Scope" icon={<Layers className="h-3 w-3" />}>
              <div className="flex flex-wrap gap-1.5">
                {(["SKU", "Brand", "Supplier"] as Scope[]).map((s) => (
                  <button
                    key={s}
                    onClick={() => setScope(scope === s ? "" : s)}
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
            <Kpi label="Total order quantity" value="40" />
            <Kpi label="Total order value" value={`SAR ${invoiceValue.toLocaleString()}`} />
            <Kpi label="Districts impacted" value={regions.toString()} />
            <Kpi label="Total suppliers fulfilled" value={new Set(rows.map((r) => r.supplier)).size.toString()} accent />
          </div>

          {/* Charts grid */}
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
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

          {/* Buyer Exposure Table */}
          <Panel
            icon={<Search className="h-4 w-4" />}
            title="Buyer exposure"
            caption={`${BUYER_EXPOSURE.length} buyers`}
          >
            <div className="mb-2 flex items-center justify-end">
              <button
                onClick={() => {
                  const headers = ["Buyer Name", "Phone Number", "District", "Qty (KG)", "Total Deliveries", "Total Suppliers", "Latest Delivered"];
                  const csv = [
                    headers.join(","),
                    ...BUYER_EXPOSURE.map((b) =>
                      [b.buyer, b.phone, b.district, b.qty, b.totalDeliveries, b.totalSuppliers, b.latestDelivered].join(",")
                    ),
                  ].join("\n");
                  const blob = new Blob([csv], { type: "text/csv" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = "buyer-exposure.csv";
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-[11px] font-medium hover:bg-black/5"
                style={{ borderColor: "oklch(0.55 0.1 40 / 0.25)", color: COCOA }}
              >
                <FileCheck2 className="h-3 w-3" /> Download CSV
              </button>
            </div>
            <div
              className="max-h-[260px] overflow-auto rounded-lg border"
              style={{ borderColor: "oklch(0.55 0.1 40 / 0.15)" }}
            >
              <table className="w-full text-xs">
                <thead className="sticky top-0" style={{ background: "oklch(0.97 0.02 60)" }}>
                  <tr className="text-left" style={{ color: COCOA }}>
                    <th className="px-2 py-2">Buyer Name</th>
                    <th className="px-2 py-2">Phone Number</th>
                    <th className="px-2 py-2">District</th>
                    <th className="px-2 py-2 text-right">Qty (KG)</th>
                    <th className="px-2 py-2 text-right">Total Deliveries</th>
                    <th className="px-2 py-2 text-right">Total Suppliers</th>
                    <th className="px-2 py-2">Latest Delivered</th>
                  </tr>
                </thead>
                <tbody>
                  {BUYER_EXPOSURE.map((b) => (
                    <tr
                      key={b.id}
                      className="border-t transition hover:bg-black/[0.02]"
                      style={{ borderColor: "oklch(0.55 0.1 40 / 0.12)" }}
                    >
                      <td className="px-2 py-2 font-medium">{b.buyer}</td>
                      <td className="px-2 py-2 font-mono text-[10px]">{b.phone}</td>
                      <td className="px-2 py-2">{b.district}</td>
                      <td className="px-2 py-2 text-right">{b.qty.toLocaleString()}</td>
                      <td className="px-2 py-2 text-right">{b.totalDeliveries}</td>
                      <td className="px-2 py-2 text-right">{b.totalSuppliers}</td>
                      <td className="px-2 py-2">{b.latestDelivered}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>
        </section>

        {/* RIGHT — Actions (only in builder view) */}
        {view === "builder" && (
        <aside className="space-y-3 lg:sticky lg:top-[120px] lg:self-start">
          <Panel icon={<Ban className="h-4 w-4" />} title="Restriction actions">
            <ActionBtn>Restrict SKU</ActionBtn>
            <ActionBtn>Restrict Brand</ActionBtn>
            <ActionBtn>Restrict Supplier</ActionBtn>
          </Panel>

          <Panel icon={<Bell className="h-4 w-4" />} title="Recall actions">
            <ActionBtn>Notify Buyers</ActionBtn>
            <ActionBtn>Notify Sellers</ActionBtn>
            <div className="mt-2">
              <label className="mb-1 flex items-center justify-between text-[10px] font-medium uppercase tracking-wider" style={{ color: "oklch(0.45 0.04 40)" }}>
                <span>Note</span>
                <span style={{ color: note.length >= 36 ? CRITICAL : "oklch(0.55 0.04 40)" }}>{note.length}/36</span>
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value.slice(0, 36))}
                maxLength={36}
                rows={2}
                placeholder="Add a note to recipients…"
                className="w-full resize-none rounded-lg border bg-white/60 px-2.5 py-2 text-xs outline-none transition focus:border-[color:var(--ring)]"
                style={{ borderColor: "oklch(0.85 0.02 40)" }}
              />
            </div>
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
        )}
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
                  <Row k="Impacted buyers" v={impacted.toString()} />
                  <Row k="Total orders" v={impacted.toString()} />
                  <Row k="Total order quantity" v="40" />
                  <Row k="Total order value" v={`SAR ${invoiceValue.toLocaleString()}`} />
                  <Row k="Districts impacted" v={regions.toString()} />
                  <Row k="Total suppliers fulfilled" v={new Set(rows.map((r) => r.supplier)).size.toString()} />
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
                  Buyers notified · Inventories frozen · SKUs restricted
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

function TopTab({
  active,
  onClick,
  icon,
  label,
  badge,
  primary,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  badge?: string;
  primary?: boolean;
}) {
  const baseActive = primary
    ? { background: `linear-gradient(135deg, ${CRITICAL}, ${CORAL})`, color: "white", borderColor: "transparent" }
    : { background: ESPRESSO, color: "white", borderColor: ESPRESSO };
  const baseIdle = primary
    ? { background: `${CORAL.replace(")", " / 0.10)")}`, color: CRITICAL, borderColor: CORAL.replace(")", " / 0.35)") }
    : { background: "white", color: ESPRESSO, borderColor: "oklch(0.55 0.1 40 / 0.2)" };
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition hover:scale-[1.02]"
      style={active ? baseActive : baseIdle}
    >
      {icon}
      {label}
      {badge && (
        <span
          className="ml-1 rounded-full px-1.5 py-0.5 text-[10px] font-bold"
          style={{
            background: active ? "oklch(1 0 0 / 0.25)" : "oklch(0.95 0.05 25)",
            color: active ? "white" : CRITICAL,
          }}
        >
          {badge}
        </span>
      )}
    </button>
  );
}

function statusTone(s: ActiveRecall["status"]) {
  if (s === "Open") return { bg: `${CRITICAL.replace(")", " / 0.12)")}`, fg: CRITICAL };
  return { bg: "oklch(0.95 0.06 160)", fg: "oklch(0.45 0.16 160)" };
}


function severityTone(s: Severity) {
  if (s === "Critical") return CRITICAL;
  if (s === "High") return WARN;
  if (s === "Medium") return "oklch(0.6 0.15 90)";
  return "oklch(0.55 0.12 240)";
}

function ActiveRecallsView() {
  const [openId, setOpenId] = useState<string | null>(ACTIVE_RECALLS[0]?.id ?? null);
  return (
    <div className="mx-auto max-w-[1700px] px-4 py-5">
      <div className="mb-4 flex items-end justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Active Recalls</h2>
          <p className="text-xs" style={{ color: COCOA }}>
            {ACTIVE_RECALLS.length} recalls in progress · click a row to expand for details
          </p>
        </div>
      </div>
      <div className="space-y-2">
        {ACTIVE_RECALLS.map((r) => {
          const open = openId === r.id;
          const tone = statusTone(r.status);
          const sev = severityTone(r.severity);
          const ackPct = Math.round((r.buyersAck / r.buyersNotified) * 100);
          return (
            <div
              key={r.id}
              className="overflow-hidden rounded-xl border bg-white transition"
              style={{ borderColor: open ? CORAL.replace(")", " / 0.45)") : "oklch(0.55 0.1 40 / 0.15)" }}
            >
              <button
                onClick={() => setOpenId(open ? null : r.id)}
                className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-black/[0.02]"
              >
                <span
                  className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold"
                  style={{ background: tone.bg, color: tone.fg }}
                >
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full" style={{ background: tone.fg }} />
                  {r.status}
                </span>
                <span className="font-mono text-[11px]" style={{ color: COCOA }}>{r.id}</span>
                <span className="min-w-0 flex-1 truncate text-sm font-semibold">{r.title}</span>
                <span
                  className="hidden rounded-full px-2 py-0.5 text-[10px] font-medium md:inline-flex"
                  style={{ background: `${sev.replace(")", " / 0.12)")}`, color: sev }}
                >
                  {r.severity}
                </span>
                <span className="hidden text-[11px] md:inline" style={{ color: COCOA }}>
                  {r.buyersAck}/{r.buyersNotified} ack
                </span>
                <span className="hidden text-[11px] md:inline" style={{ color: COCOA }}>
                  {r.qty.toLocaleString()} KG
                </span>
                <ChevronRight
                  className="h-4 w-4 transition"
                  style={{ color: COCOA, transform: open ? "rotate(90deg)" : "none" }}
                />
              </button>
              {open && (
                <div
                  className="border-t"
                  style={{ borderColor: "oklch(0.55 0.1 40 / 0.12)", background: "oklch(0.98 0.015 60)" }}
                >
                  <div className="px-4 py-3">
                    <p className="mb-3 text-xs leading-relaxed" style={{ color: ESPRESSO }}>
                      {r.brief}
                    </p>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[11px] md:grid-cols-4">
                      <Detail k="Scope" v={`${r.scope} recall`} />
                      <Detail k="SKU" v={r.sku} />
                      <Detail k="Brand" v={r.brand} />
                      <Detail k="Supplier" v={r.supplier} />
                      <Detail k="Batch" v={r.batch} />
                      <Detail k="Launched" v={r.launched} />
                      <Detail k="Districts" v={r.districts.join(", ")} />
                      <Detail k="Total Customers" v={r.totalCustomers.toLocaleString()} />
                      <Detail k="Total Suppliers" v={r.totalSuppliers.toLocaleString()} />
                      <Detail k="Total Value" v={`SAR ${r.totalValue.toLocaleString()}`} />
                      <Detail k="Quantity recalled" v={`${r.qty.toLocaleString()} KG`} />
                      <Detail k="Acknowledgement" v={`${ackPct}% (${r.buyersAck}/${r.buyersNotified})`} />
                    </div>
                  </div>
                  <SupportUpdatesPanel recallId={r.id} updates={r.updates} />
                </div>
              )}

            </div>
          );
        })}
      </div>
    </div>
  );
}

function Detail({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider" style={{ color: COCOA }}>{k}</div>
      <div className="font-medium" style={{ color: ESPRESSO }}>{v}</div>
    </div>
  );
}

function RestrictedView() {
  const [tab, setTab] = useState<"All" | "SKU" | "Brand" | "Supplier">("All");
  const filtered = tab === "All" ? RESTRICTIONS : RESTRICTIONS.filter((r) => r.kind === tab);
  return (
    <div className="mx-auto max-w-[1700px] px-4 py-5">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Restricted Products</h2>
          <p className="text-xs" style={{ color: COCOA }}>
            SKUs, brands and suppliers under restriction · linked to source recall incident
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {(["All", "SKU", "Brand", "Supplier"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="rounded-full border px-2.5 py-1 text-[11px] font-medium transition"
              style={
                tab === t
                  ? { background: ESPRESSO, color: "white", borderColor: ESPRESSO }
                  : { borderColor: "oklch(0.55 0.1 40 / 0.25)", color: COCOA, background: "white" }
              }
            >
              {t}
              <span className="ml-1 text-[10px] opacity-70">
                {t === "All" ? RESTRICTIONS.length : RESTRICTIONS.filter((r) => r.kind === t).length}
              </span>
            </button>
          ))}
        </div>
      </div>
      <div
        className="overflow-hidden rounded-xl border bg-white"
        style={{ borderColor: "oklch(0.55 0.1 40 / 0.15)" }}
      >
        <table className="w-full text-xs">
          <thead style={{ background: "oklch(0.97 0.02 60)" }}>
            <tr className="text-left" style={{ color: COCOA }}>
              <th className="px-3 py-2">Type</th>
              <th className="px-3 py-2">Name</th>
              <th className="px-3 py-2">Context</th>
              <th className="px-3 py-2">Effective Date</th>
              <th className="px-3 py-2">Recall ID</th>
              <th className="px-3 py-2">Incident</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id} className="border-t" style={{ borderColor: "oklch(0.55 0.1 40 / 0.12)" }}>
                <td className="px-3 py-2">
                  <span
                    className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold"
                    style={{
                      background:
                        r.kind === "SKU"
                          ? "oklch(0.95 0.04 250)"
                          : r.kind === "Brand"
                            ? "oklch(0.95 0.05 25)"
                            : "oklch(0.95 0.06 160)",
                      color:
                        r.kind === "SKU"
                          ? "oklch(0.45 0.18 250)"
                          : r.kind === "Brand"
                            ? CRITICAL
                            : "oklch(0.45 0.16 160)",
                    }}
                  >
                    {r.kind === "SKU" ? <Barcode className="h-3 w-3" /> : r.kind === "Brand" ? <Tag className="h-3 w-3" /> : <Building2 className="h-3 w-3" />}
                    {r.kind}
                  </span>
                </td>
                <td className="px-3 py-2 font-medium">{r.name}</td>
                <td className="px-3 py-2" style={{ color: COCOA }}>{r.context}</td>
                <td className="px-3 py-2 font-mono text-[11px]">{r.effective}</td>
                <td className="px-3 py-2 font-mono text-[11px]" style={{ color: CRITICAL }}>{r.recallId}</td>
                <td className="px-3 py-2" style={{ color: ESPRESSO }}>{r.incident}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}


