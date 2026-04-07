import { useState, useEffect } from "react";

// ─── Design Tokens ────────────────────────────────────────────────────────────
const C = {
  sand:        "#F5F0E8",
  sandDark:    "#EDE6D6",
  ink:         "#1A1A2E",
  inkLight:    "#3D3D5C",
  inkMuted:    "#8888A4",
  terra:       "#C4622D",
  terraLight:  "#E8895A",
  terraPale:   "#F5E6DC",
  teal:        "#2A7D6F",
  tealLight:   "#3DADA0",
  tealPale:    "#D6EDEB",
  gold:        "#C89B3C",
  goldPale:    "#F5EDDA",
  danger:      "#C0392B",
  dangerPale:  "#FDECEA",
  white:       "#FFFFFF",
};

const CATS = ["Food", "Transport", "Lodging", "Activities", "Supplies", "Other"];
const CAT_META = {
  Food:       { icon: "🍜", color: C.terra,     pale: C.terraPale },
  Transport:  { icon: "✈️", color: C.teal,      pale: C.tealPale  },
  Lodging:    { icon: "🏨", color: C.gold,      pale: C.goldPale  },
  Activities: { icon: "🎭", color: C.tealLight, pale: C.tealPale  },
  Supplies:   { icon: "🧴", color: "#7B6EA0",   pale: "#EEEAF5"   },
  Other:      { icon: "📦", color: C.inkMuted,  pale: C.sandDark  },
};

// ─── Unsplash Banner ──────────────────────────────────────────────────────────
// Uses Unsplash Source — free, no API key required
function useBannerImage(query) {
  const [url, setUrl] = useState(null);
  useEffect(() => {
    if (!query) return;
    const src = `https://source.unsplash.com/800x400/?${encodeURIComponent(query + ",travel,landscape")}`;
    const img = new Image();
    img.onload = () => setUrl(src);
    img.src = src;
  }, [query]);
  return url;
}

function TripBanner({ query, fallback, height, children }) {
  const photoUrl = useBannerImage(query);
  return (
    <div style={{ height, position: "relative", overflow: "hidden", background: fallback, flexShrink: 0 }}>
      {photoUrl && (
        <img src={photoUrl} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 40%" }} />
      )}
      {/* gradient scrim — bottom-heavy so text over it stays readable */}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(8,10,22,0.78) 0%, rgba(8,10,22,0.3) 55%, rgba(8,10,22,0.1) 100%)" }} />
      <div style={{ position: "relative", zIndex: 1, height: "100%", display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
        {children}
      </div>
    </div>
  );
}

// ─── Mock Data ────────────────────────────────────────────────────────────────
const MOCK_TRIPS = [
  {
    id: 1, name: "Tokyo & Kyoto", destination: "Japan", flag: "🇯🇵",
    unsplashQuery: "Tokyo Japan city",
    fallbackBg: "linear-gradient(135deg, #1A1A2E 0%, #2A4858 100%)",
    start: "2026-04-12", end: "2026-04-22", status: "active",
    members: ["You", "Marco", "Sofia"],
    budgets: { Food: 600, Transport: 280, Lodging: 980, Activities: 420, Supplies: 80, Other: 460 },
    itinerary: [
      { id: 1, date: "2026-04-12", time: "11:30am", title: "Flight — DFW → NRT", location: "American AA169", category: "Transport", cost: 1240, notes: "" },
      { id: 2, date: "2026-04-12", time: "3:00pm",  title: "Narita Express to Shinjuku", location: "~80 min · JR Pass", category: "Transport", cost: 0, notes: "" },
      { id: 3, date: "2026-04-12", time: "6:00pm",  title: "Shinjuku Granbell Hotel", location: "Check-in · 5 nights", category: "Lodging", cost: 620, notes: "" },
      { id: 4, date: "2026-04-13", time: "9:00am",  title: "Senso-ji Temple", location: "Asakusa · Free entry", category: "Activities", cost: 0, notes: "Morning visit" },
      { id: 5, date: "2026-04-13", time: "1:00pm",  title: "Lunch — Ramen Nagi", location: "Shinjuku", category: "Food", cost: 18, notes: "" },
      { id: 6, date: "2026-04-13", time: "5:00pm",  title: "Tokyo Skytree", location: "Evening · Top deck", category: "Activities", cost: 22, notes: "" },
      { id: 7, date: "2026-04-14", time: "10:00am", title: "teamLab Planets", location: "Toyosu · Tickets booked", category: "Activities", cost: 32, notes: "" },
      { id: 8, date: "2026-04-14", time: "1:00pm",  title: "Tsukiji Outer Market", location: "Lunch + snacks", category: "Food", cost: 40, notes: "" },
    ],
    expenses: [
      { id: 1, category: "Transport", amount: 1240, description: "AA169 DFW → NRT", date: "2026-04-12", paidBy: "You", itineraryId: 1 },
      { id: 2, category: "Lodging",   amount: 620,  description: "Shinjuku Granbell Hotel", date: "2026-04-12", paidBy: "You", itineraryId: 3 },
      { id: 3, category: "Food",      amount: 18,   description: "Ramen Nagi", date: "2026-04-13", paidBy: "Marco", itineraryId: 5 },
      { id: 4, category: "Supplies",  amount: 24,   description: "Travel toiletries & TSA bags", date: "2026-04-08", paidBy: "You", itineraryId: null },
      { id: 5, category: "Supplies",  amount: 16,   description: "Portable charger", date: "2026-04-10", paidBy: "You", itineraryId: null },
    ],
  },
  {
    id: 2, name: "Paris Long Weekend", destination: "France", flag: "🇫🇷",
    unsplashQuery: "Paris France Eiffel Tower",
    fallbackBg: "linear-gradient(135deg, #4A1942 0%, #8B3A8B 100%)",
    start: "2026-06-05", end: "2026-06-09", status: "upcoming",
    members: ["You", "Sofia"],
    budgets: { Food: 400, Transport: 800, Lodging: 900, Activities: 300, Supplies: 60, Other: 400 },
    itinerary: [],
    expenses: [],
  },
  {
    id: 3, name: "Bali Retreat", destination: "Indonesia", flag: "🇮🇩",
    unsplashQuery: "Bali Indonesia rice terrace",
    fallbackBg: "linear-gradient(135deg, #1A3A1A 0%, #2D7A3A 100%)",
    start: "2026-01-03", end: "2026-01-12", status: "completed",
    members: ["You", "Kenji", "Marco"],
    budgets: { Food: 600, Transport: 400, Lodging: 1200, Activities: 800, Supplies: 100, Other: 500 },
    itinerary: [],
    expenses: [
      { id: 10, category: "Food",       amount: 420,  description: "All meals",           date: "2026-01-03", paidBy: "You", itineraryId: null },
      { id: 11, category: "Lodging",    amount: 1100, description: "Villa Karma",          date: "2026-01-03", paidBy: "You", itineraryId: null },
      { id: 12, category: "Transport",  amount: 380,  description: "Flights + transfers",  date: "2026-01-03", paidBy: "You", itineraryId: null },
      { id: 13, category: "Activities", amount: 620,  description: "Tours & activities",   date: "2026-01-03", paidBy: "You", itineraryId: null },
      { id: 14, category: "Other",      amount: 290,  description: "Shopping & misc",      date: "2026-01-03", paidBy: "You", itineraryId: null },
    ],
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt     = (d, opts = { month: "short", day: "numeric" }) => new Date(d).toLocaleDateString("en-US", opts);
const fmtFull = d => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
const byDate  = items => items.reduce((a, i) => { (a[i.date] = a[i.date] || []).push(i); return a; }, {});
const sumAmt  = arr => arr.reduce((s, e) => s + e.amount, 0);
const sumBudget = b => Object.values(b).reduce((s, v) => s + v, 0);

// ─── Base UI ──────────────────────────────────────────────────────────────────
function SectionLabel({ children }) {
  return <p style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em", color: C.inkMuted, marginBottom: 8 }}>{children}</p>;
}

function FormInput({ label, ...p }) {
  return (
    <div style={{ marginBottom: 14 }}>
      {label && <SectionLabel>{label}</SectionLabel>}
      <input {...p} style={{ width: "100%", padding: "10px 13px", borderRadius: 8, border: `1px solid rgba(26,26,46,0.15)`, background: C.white, fontSize: 14, color: C.ink, outline: "none", fontFamily: "inherit", boxSizing: "border-box", ...p.style }} />
    </div>
  );
}

function BtnPrimary({ children, onClick, full, style: s = {} }) {
  return (
    <button onClick={onClick} style={{ padding: "10px 18px", borderRadius: 8, background: C.terra, color: C.white, border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", display: "inline-flex", alignItems: "center", gap: 6, width: full ? "100%" : "auto", justifyContent: full ? "center" : "flex-start", ...s }}>{children}</button>
  );
}

function BtnGhost({ children, onClick, style: s = {} }) {
  return (
    <button onClick={onClick} style={{ padding: "10px 14px", borderRadius: 8, border: `1px solid rgba(26,26,46,0.15)`, background: C.white, fontSize: 13, fontWeight: 500, color: C.inkMuted, cursor: "pointer", fontFamily: "inherit", ...s }}>{children}</button>
  );
}

function ProgressBar({ pct, color = C.tealLight, height = 4 }) {
  return (
    <div style={{ height, background: C.sandDark, borderRadius: 2, overflow: "hidden" }}>
      <div style={{ height: "100%", width: `${Math.min(100, pct)}%`, background: color, borderRadius: 2 }} />
    </div>
  );
}

function Sheet({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 300, display: "flex", alignItems: "flex-end" }}>
      <div style={{ position: "absolute", inset: 0, background: "rgba(26,26,46,0.5)", backdropFilter: "blur(3px)" }} onClick={onClose} />
      <div style={{ position: "relative", width: "100%", background: C.white, borderRadius: "12px 12px 0 0", padding: "20px 20px 40px", maxHeight: "88vh", overflowY: "auto", boxShadow: "0 -8px 40px rgba(26,26,46,0.14)" }}>
        <div style={{ width: 36, height: 4, borderRadius: 2, background: "rgba(26,26,46,0.15)", margin: "0 auto 20px" }} />
        <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: C.ink, marginBottom: 20 }}>{title}</p>
        {children}
      </div>
    </div>
  );
}

function TopNav({ onBack, backLabel, action }) {
  return (
    <div style={{ position: "sticky", top: 0, zIndex: 100, background: C.ink, borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "0 20px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <div>
        {onBack
          ? <button onClick={onBack} style={{ background: "none", border: "none", color: "rgba(245,240,232,0.65)", fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>← {backLabel}</button>
          : <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: C.sand }}>Trip<span style={{ color: C.terraLight }}>Track</span></span>
        }
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {action}
        {!onBack && <div style={{ width: 32, height: 32, borderRadius: "50%", background: C.terra, color: C.white, fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center" }}>F</div>}
      </div>
    </div>
  );
}

// ─── Login ────────────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }) {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 20px", background: `radial-gradient(ellipse 60% 50% at 20% 80%, rgba(196,98,45,0.18) 0%, transparent 60%), radial-gradient(ellipse 50% 40% at 80% 20%, rgba(42,125,111,0.15) 0%, transparent 60%), ${C.ink}` }}>
      <div style={{ width: "100%", maxWidth: 380, textAlign: "center" }}>
        <div style={{ width: 64, height: 64, borderRadius: 18, margin: "0 auto 28px", background: "linear-gradient(135deg, #C4622D, #E8895A)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>🧭</div>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 36, fontWeight: 700, color: C.sand, lineHeight: 1.15, marginBottom: 12 }}>
          Plan trips.<br /><em style={{ color: C.terraLight, fontStyle: "normal" }}>Track every dollar.</em>
        </h1>
        <p style={{ fontSize: 15, color: C.inkMuted, lineHeight: 1.6, marginBottom: 40 }}>Build day-by-day itineraries and watch your budget in real time — from planning to landing.</p>
        <button onClick={onLogin} style={{ width: "100%", padding: "14px 20px", borderRadius: 12, background: C.white, border: "none", display: "flex", alignItems: "center", justifyContent: "center", gap: 12, fontSize: 15, fontWeight: 600, color: C.ink, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 8px 40px rgba(0,0,0,0.3)" }}>
          <svg width="20" height="20" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.29-8.16 2.29-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
          Continue with Google
        </button>
        <p style={{ marginTop: 24, fontSize: 12, color: "rgba(136,136,164,0.6)", lineHeight: 1.6 }}>Your trips sync across all your devices.<br />No password needed.</p>
      </div>
    </div>
  );
}

// ─── Trip List ────────────────────────────────────────────────────────────────
function TripCard({ trip, onClick }) {
  const spent     = sumAmt(trip.expenses);
  const budget    = sumBudget(trip.budgets);
  const remaining = budget - spent;
  const isOver    = remaining < 0;
  const pct       = Math.min(100, (spent / budget) * 100);

  // Health label — simple, always accurate, no time-based logic (v2)
  const health = trip.status === "completed"
    ? (isOver ? { label: "Went over",      color: C.danger  }
              : pct > 90 ? { label: "Broke even",     color: C.gold   }
                         : { label: "Came in under",  color: C.teal   })
    : trip.status === "upcoming"
    ? { label: "Not started", color: C.inkMuted }
    : (isOver ? { label: "Over budget",    color: C.danger  }
              : { label: "Under budget",   color: C.teal    });

  const statusLabel = trip.status === "active" ? "In progress" : trip.status === "upcoming" ? "Upcoming" : "Completed";

  return (
    <div onClick={onClick} style={{ background: C.white, borderRadius: 12, overflow: "hidden", cursor: "pointer", border: `1px solid rgba(26,26,46,0.07)`, boxShadow: "0 2px 16px rgba(26,26,46,0.08)", opacity: trip.status === "completed" ? 0.78 : 1 }}>
      <TripBanner query={trip.unsplashQuery} fallback={trip.fallbackBg} height={140}>
        <div style={{ padding: "0 14px 14px", height: "100%", display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
          <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 600, color: "#fff", textShadow: "0 1px 6px rgba(0,0,0,0.5)", marginBottom: 3 }}>{trip.name}</p>
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", textShadow: "0 1px 4px rgba(0,0,0,0.4)" }}>{trip.flag} {trip.destination} · {fmt(trip.start)} – {fmt(trip.end)}</p>
        </div>
      </TripBanner>
      <div style={{ padding: "12px 14px 10px" }}>
        {trip.status === "upcoming" ? (
          // Upcoming — no spend yet, just show total budget
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span style={{ fontSize: 13, color: C.inkMuted }}>Total budget</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: C.ink }}>${budget.toLocaleString()}</span>
          </div>
        ) : (
          // Active or completed — show remaining prominently
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: health.color, display: "inline-block", flexShrink: 0 }} />
                <span style={{ fontSize: 13, fontWeight: 600, color: health.color }}>{health.label}</span>
              </div>
              <div style={{ textAlign: "right" }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: isOver ? C.danger : C.ink }}>
                  {isOver ? "-" : ""}${Math.abs(remaining).toLocaleString()}
                </span>
                <span style={{ fontSize: 12, color: C.inkMuted }}> {isOver ? "over" : "left"}</span>
              </div>
            </div>
            <ProgressBar pct={pct} color={health.color} height={3} />
          </>
        )}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
          <p style={{ fontSize: 11, color: C.inkMuted }}>{trip.members.join(" · ")}</p>
          <p style={{ fontSize: 11, color: C.inkMuted }}>{statusLabel}</p>
        </div>
      </div>
    </div>
  );
}
function TripsScreen({ trips, onSelect, onNew }) {
  return (
    <div>
      <TopNav action={<BtnPrimary onClick={onNew} style={{ fontSize: 12, padding: "7px 14px" }}>＋ New Trip</BtnPrimary>} />
      <div style={{ padding: "28px 20px 80px" }}>
        <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 700, color: C.ink }}>My Trips</p>
        <p style={{ fontSize: 13, color: C.inkMuted, marginTop: 3, marginBottom: 28 }}>{trips.length} trips planned</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 }}>
          {trips.map(t => <TripCard key={t.id} trip={t} onClick={() => onSelect(t)} />)}
          <button onClick={onNew} style={{ background: "transparent", border: `2px dashed rgba(26,26,46,0.15)`, borderRadius: 12, padding: "32px 20px", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 8, color: C.inkMuted, fontFamily: "inherit", minHeight: 200 }}>
            <span style={{ fontSize: 28 }}>＋</span>
            <span style={{ fontSize: 14, fontWeight: 500 }}>Plan a new trip</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── New Trip ─────────────────────────────────────────────────────────────────
function NewTripScreen({ onBack, onCreate }) {
  const [form, setForm] = useState({ name: "", destination: "", start: "", end: "" });
  const [budgets, setBudgets] = useState({ Food: "", Transport: "", Lodging: "", Activities: "", Other: "" });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div>
      <TopNav onBack={onBack} backLabel="All trips" />
      <div style={{ padding: "24px 20px 60px", maxWidth: 560, margin: "0 auto" }}>
        <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 700, color: C.ink, marginBottom: 24 }}>New Trip</p>
        <FormInput label="Trip name" placeholder="e.g. Amalfi Coast" value={form.name} onChange={e => set("name", e.target.value)} />
        <FormInput label="Destination" placeholder="e.g. Italy" value={form.destination} onChange={e => set("destination", e.target.value)} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <FormInput label="Start date" type="date" value={form.start} onChange={e => set("start", e.target.value)} />
          <FormInput label="End date"   type="date" value={form.end}   onChange={e => set("end", e.target.value)} />
        </div>
        <SectionLabel>Category Budgets</SectionLabel>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24, marginTop: 4 }}>
          {CATS.map(cat => (
            <div key={cat} style={{ display: "flex", alignItems: "center", gap: 12, background: C.white, border: `1px solid rgba(26,26,46,0.08)`, borderRadius: 8, padding: "9px 13px" }}>
              <span style={{ fontSize: 16 }}>{CAT_META[cat].icon}</span>
              <span style={{ fontSize: 13, color: C.ink, width: 84 }}>{cat}</span>
              <input type="number" placeholder="—" value={budgets[cat]} onChange={e => setBudgets(b => ({ ...b, [cat]: e.target.value }))}
                style={{ flex: 1, border: "none", outline: "none", fontSize: 14, color: C.ink, fontFamily: "inherit", background: "transparent" }} />
            </div>
          ))}
        </div>
        <BtnPrimary full onClick={() => onCreate({ ...form, budgets: Object.fromEntries(CATS.map(c => [c, Number(budgets[c]) || 0])) })}>
          Create trip
        </BtnPrimary>
      </div>
    </div>
  );
}

// ─── Trip Detail ──────────────────────────────────────────────────────────────
function TripDetailScreen({ trip, onBack, onAddExpense }) {
  const [tab, setTab] = useState("itinerary");
  const [showAddItem, setShowAddItem] = useState(false);
  const spent    = sumAmt(trip.expenses);
  const budget   = sumBudget(trip.budgets);
  const remaining = budget - spent;
  const pct      = Math.min(100, (spent / budget) * 100);
  const isOver   = remaining < 0;

  return (
    <div>
      {/* Sticky top nav */}
      <TopNav onBack={onBack} backLabel="All trips" />

      {/* Full-bleed photo hero */}
      <TripBanner query={trip.unsplashQuery} fallback={trip.fallbackBg} height={140}>
        <div style={{ padding: "0 20px 0" }}>
          <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 700, color: "#fff", marginBottom: 3, textShadow: "0 1px 8px rgba(0,0,0,0.4)" }}>{trip.name}</p>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", marginBottom: 18, textShadow: "0 1px 4px rgba(0,0,0,0.4)" }}>
            {trip.flag} {trip.destination} · {fmt(trip.start, { month: "short", day: "numeric" })} – {fmtFull(trip.end)}
          </p>
        </div>
      </TripBanner>

      {/* Budget bar — Budget / Spent / Remaining only */}
      <div style={{ background: C.ink, padding: "16px 20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <p style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px", color: "rgba(245,240,232,0.4)" }}>Budget Overview</p>
          <span style={{ fontSize: 12, fontWeight: 500, color: isOver ? C.danger : C.teal }}>● {isOver ? "Over budget" : "Under budget"}</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 14 }}>
          {[
            { label: "Budget",    val: `${budget.toLocaleString()}`,              color: C.sand },
            { label: "Spent",     val: `${spent.toLocaleString()}`,              color: C.terraLight },
            { label: "Remaining", val: `${Math.abs(remaining).toLocaleString()}`, color: remaining < 0 ? C.terraLight : C.tealLight },
          ].map(n => (
            <div key={n.label}>
              <p style={{ fontSize: 10, color: "rgba(245,240,232,0.4)", textTransform: "uppercase", letterSpacing: "0.5px" }}>{n.label}</p>
              <p style={{ fontSize: 17, fontWeight: 700, color: n.color, marginTop: 2 }}>{n.val}</p>
            </div>
          ))}
        </div>
        <div style={{ height: 5, background: "rgba(255,255,255,0.1)", borderRadius: 3, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${pct}%`, background: `linear-gradient(90deg, ${C.tealLight}, ${C.teal})`, borderRadius: 3 }} />
        </div>
      </div>

      {/* Tabs */}
      <div style={{ background: C.white, borderBottom: `1px solid rgba(26,26,46,0.08)`, display: "flex", padding: "0 18px", position: "sticky", top: 56, zIndex: 50 }}>
        {["itinerary", "budget"].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ padding: "13px 16px", fontSize: 14, fontWeight: 500, cursor: "pointer", background: "none", border: "none", fontFamily: "inherit", color: tab === t ? C.terra : C.inkMuted, borderBottom: `2px solid ${tab === t ? C.terra : "transparent"}`, textTransform: "capitalize" }}>{t}</button>
        ))}
      </div>

      <div style={{ padding: "18px 20px 80px", maxWidth: 800, margin: "0 auto" }}>
        {tab === "itinerary" && <ItineraryTab trip={trip} onAddActivity={() => setShowAddItem(true)} />}
        {tab === "budget"    && <BudgetTab trip={trip} onAddExpense={onAddExpense} />}
      </div>

      <Sheet open={showAddItem} onClose={() => setShowAddItem(false)} title="Add to itinerary">
        <AddItemForm onClose={() => setShowAddItem(false)} trip={trip} />
      </Sheet>
    </div>
  );
}

// ─── Itinerary Tab ────────────────────────────────────────────────────────────
function ItineraryTab({ trip, onAddActivity }) {
  const grouped = byDate(trip.itinerary);
  const dates = Object.keys(grouped).sort();
  const todayStr = new Date().toISOString().split("T")[0];
  const activeDate = dates.includes(todayStr) ? todayStr : dates[0] || null;

  // Scroll to today on mount
  useEffect(() => {
    if (activeDate) {
      const el = document.getElementById(`day-${activeDate}`);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [activeDate]);

  if (!dates.length) return (
    <div style={{ textAlign: "center", padding: "48px 0" }}>
      <p style={{ fontSize: 13, color: C.inkMuted, marginBottom: 16 }}>No activities yet.</p>
      <BtnPrimary onClick={onAddActivity}>＋ Plan activity</BtnPrimary>
    </div>
  );

  return (
    <div>
      {/* Header row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        {activeDate && (
          <button onClick={() => {
            const el = document.getElementById(`day-${activeDate}`);
            if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
          }} style={{
            padding: "5px 14px", borderRadius: 20, fontSize: 12, fontWeight: 600,
            cursor: "pointer", fontFamily: "inherit",
            background: C.terraPale, color: C.terra,
            border: `1px solid ${C.terra}`,
          }}>Today</button>
        )}
        <BtnPrimary onClick={onAddActivity} style={{ fontSize: 12, padding: "7px 14px", marginLeft: "auto" }}>＋ Plan activity</BtnPrimary>
      </div>

      {/* All days */}
      {dates.map((date, di) => {
        const isToday = date === activeDate;
        return (
          <div key={date} id={`day-${date}`} style={{ marginBottom: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
              <span style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "1.2px", color: isToday ? C.terra : C.inkMuted }}>
                {isToday ? "Today" : `Day ${di + 1}`} · {fmt(date, { weekday: "short", month: "short", day: "numeric" })}
              </span>
              <div style={{ flex: 1, height: 1, background: isToday ? C.terraPale : "rgba(26,26,46,0.1)" }} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {grouped[date].map(item => {
                const m = CAT_META[item.category] || CAT_META.Other;
                const hasExp = trip.expenses.some(e => e.itineraryId === item.id);
                return (
                  <div key={item.id} style={{ background: C.white, borderRadius: 8, padding: "11px 13px", display: "flex", alignItems: "center", gap: 12, border: `1px solid ${isToday ? C.terraPale : "rgba(26,26,46,0.06)"}`, boxShadow: "0 1px 5px rgba(26,26,46,0.05)" }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: m.pale, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>{m.icon}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 14, fontWeight: 500, color: C.ink }}>{item.title}</p>
                      <p style={{ fontSize: 12, color: C.inkMuted, marginTop: 1 }}>{item.location}</p>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: hasExp ? C.terra : C.ink }}>${item.cost.toLocaleString()}{hasExp ? " spent" : ""}</p>
                      {item.time && <p style={{ fontSize: 11, color: C.inkMuted }}>{item.time}</p>}
                    </div>
                  </div>
                );
              })}
              <button style={{ width: "100%", padding: "9px", border: `1px dashed rgba(26,26,46,0.15)`, borderRadius: 8, background: "transparent", cursor: "pointer", fontSize: 12, color: C.inkMuted, fontFamily: "inherit" }}>＋ Add to Day {di + 1}</button>
            </div>
          </div>
        );
      })}
    </div>
  );
}


// ─── Category Icon ───────────────────────────────────────────────────────────
const CAT_ICONS = {
  Food:       ({ color }) => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8h1a4 4 0 010 8h-1"/><path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>,
  Transport:  ({ color }) => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2L11 13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>,
  Lodging:    ({ color }) => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  Activities: ({ color }) => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  Supplies:   ({ color }) => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>,
  Other:      ({ color }) => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>,
};
function CatIcon({ cat, color }) {
  const Icon = CAT_ICONS[cat] || CAT_ICONS.Other;
  return <span style={{ display: "inline-flex", alignItems: "center", flexShrink: 0 }}><Icon color={color} /></span>;
}

// ─── Budget Tab ─────────────────────────────────────────────────────────────
// Job: drill-down into WHERE money went — category bars + full expense log.
// The Budget/Spent/Remaining summary lives in the hero bar above the tabs.
function BudgetTab({ trip, onAddExpense }) {
  const catSpent = CATS.reduce((a, c) => { a[c] = trip.expenses.filter(e => e.category === c).reduce((s, e) => s + e.amount, 0); return a; }, {});

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
        <BtnPrimary onClick={onAddExpense} style={{ fontSize: 12, padding: "7px 14px" }}>＋ Log expense</BtnPrimary>
      </div>
      <SectionLabel>By Category</SectionLabel>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 28 }}>
        {CATS.map(cat => {
          const m    = CAT_META[cat];
          const s    = catSpent[cat] || 0;
          const b    = trip.budgets[cat] || 0;
          const p    = b ? Math.min(100, (s / b) * 100) : 0;
          const over = s > b && b > 0;
          const barC = over ? C.danger : cat === "Food" ? C.terra : cat === "Lodging" ? C.gold : C.tealLight;
          return (
            <div key={cat} style={{ background: C.white, borderRadius: 8, padding: "12px 14px", border: `1px solid rgba(26,26,46,0.06)` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: b > 0 ? 8 : 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <CatIcon cat={cat} color={over ? C.danger : barC} />
                  <span style={{ fontSize: 14, fontWeight: 500, color: C.ink }}>{cat}</span>
                </div>
                <div style={{ fontSize: 12, color: C.inkMuted, display: "flex", gap: 12 }}>
                  {b > 0 && <span>${b.toLocaleString()} budget</span>}
                  <span style={{ fontWeight: 600, color: over ? C.danger : C.ink }}>${s.toLocaleString()} spent</span>
                </div>
              </div>
              {b > 0 && <ProgressBar pct={p} color={barC} height={4} />}
              {over && <p style={{ fontSize: 11, color: C.danger, marginTop: 5, fontWeight: 600 }}>${s - b} over budget</p>}
            </div>
          );
        })}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <SectionLabel>Expenses</SectionLabel>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {[...trip.expenses].reverse().map(exp => {
          const m = CAT_META[exp.category] || CAT_META.Other;
          const linked = exp.itineraryId ? trip.itinerary.find(i => i.id === exp.itineraryId) : null;
          const d = new Date(exp.date);
          const isPreTrip = exp.date < trip.start;
          return (
            <div key={exp.id} style={{ background: C.white, borderRadius: 8, padding: "11px 14px", display: "flex", gap: 12, border: `1px solid rgba(26,26,46,0.06)` }}>
              <div style={{ width: 38, textAlign: "center", flexShrink: 0 }}>
                <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: C.ink, lineHeight: 1 }}>{d.getDate()}</p>
                <p style={{ fontSize: 10, color: C.inkMuted, textTransform: "uppercase", letterSpacing: "0.5px" }}>{d.toLocaleDateString("en-US", { month: "short" })}</p>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 2 }}>
                  <p style={{ fontSize: 13, fontWeight: 500, color: C.ink }}>{exp.description}</p>
                  {isPreTrip && <span style={{ fontSize: 10, fontWeight: 600, background: C.goldPale, color: C.gold, padding: "1px 7px", borderRadius: 20, whiteSpace: "nowrap" }}>Pre-trip</span>}
                </div>
                <p style={{ fontSize: 12, color: C.inkMuted, display: "flex", alignItems: "center", gap: 5 }}><CatIcon cat={exp.category} color={C.inkMuted} /> {exp.category}{linked ? ` · ${linked.title}` : ""}</p>
              </div>
              <p style={{ fontSize: 14, fontWeight: 600, color: C.terra, whiteSpace: "nowrap" }}>${exp.amount.toLocaleString()}</p>
            </div>
          );
        })}
        {!trip.expenses.length && <p style={{ fontSize: 13, color: C.inkMuted, textAlign: "center", padding: "20px 0" }}>No expenses logged yet.</p>}
      </div>
    </div>
  );
}
// ─── Add Item Form ────────────────────────────────────────────────────────────
function AddItemForm({ onClose }) {
  const [type, setType] = useState("Activity");
  const types = { Transport: "✈️", Meal: "🍜", Activity: "🎭", Stay: "🏨", Other: "📝" };
  return (
    <div>
      <div style={{ marginBottom: 14 }}>
        <SectionLabel>Type</SectionLabel>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {Object.entries(types).map(([t, icon]) => (
            <button key={t} onClick={() => setType(t)} style={{ padding: "7px 13px", borderRadius: 20, fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: "inherit", background: type === t ? C.terra : C.white, color: type === t ? C.white : C.inkMuted, border: `1px solid ${type === t ? C.terra : "rgba(26,26,46,0.15)"}` }}>{icon} {t}</button>
          ))}
        </div>
      </div>
      <FormInput label="Name" placeholder="e.g. Dinner at Sukiyabashi Jiro" />
      <FormInput label="Time (optional)" placeholder="e.g. 7:30pm" />
      <FormInput label="Location (optional)" placeholder="e.g. Ginza, Tokyo" />
      <FormInput label="Notes (optional)" placeholder="Reservation #, reminders…" />
      <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
        <BtnGhost onClick={onClose} style={{ flex: 1, textAlign: "center", justifyContent: "center" }}>Cancel</BtnGhost>
        <BtnPrimary onClick={onClose} style={{ flex: 2, justifyContent: "center" }}>Save Item</BtnPrimary>
      </div>
    </div>
  );
}

// ─── Expense Sheet ────────────────────────────────────────────────────────────
function ExpenseSheet({ open, onClose, trip, onSave }) {
  const [form, setForm] = useState({ category: "Food", amount: "", description: "", date: new Date().toISOString().split("T")[0], paidBy: "You", itineraryId: "" });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  return (
    <Sheet open={open} onClose={onClose} title="Log an Expense">
      <div style={{ marginBottom: 14 }}>
        <SectionLabel>Category</SectionLabel>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {CATS.map(c => (
            <button key={c} onClick={() => set("category", c)} style={{ padding: "7px 13px", borderRadius: 20, fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: "inherit", background: form.category === c ? C.terra : C.white, color: form.category === c ? C.white : C.inkMuted, border: `1px solid ${form.category === c ? C.terra : "rgba(26,26,46,0.15)"}` }}>{CAT_META[c].icon} {c}</button>
          ))}
        </div>
      </div>
      <FormInput label="Amount ($)" type="number" placeholder="0.00" value={form.amount} onChange={e => set("amount", e.target.value)} />
      <FormInput label="Description" placeholder="What was this for?" value={form.description} onChange={e => set("description", e.target.value)} />
      <FormInput label="Date" type="date" value={form.date} onChange={e => set("date", e.target.value)} />
      <FormInput label="Paid by" placeholder="Your name" value={form.paidBy} onChange={e => set("paidBy", e.target.value)} />
      <div style={{ marginBottom: 14 }}>
        <SectionLabel>Link to itinerary item (optional)</SectionLabel>
        <select value={form.itineraryId} onChange={e => set("itineraryId", e.target.value)} style={{ width: "100%", padding: "10px 13px", borderRadius: 8, border: `1px solid rgba(26,26,46,0.15)`, background: C.white, fontSize: 14, color: C.ink, outline: "none", fontFamily: "inherit" }}>
          <option value="">None</option>
          {trip.itinerary.map(i => <option key={i.id} value={i.id}>{fmt(i.date)} – {i.title}</option>)}
        </select>
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        <BtnGhost onClick={onClose} style={{ flex: 1, textAlign: "center", justifyContent: "center" }}>Cancel</BtnGhost>
        <BtnPrimary onClick={() => { onSave(form); onClose(); }} style={{ flex: 2, justifyContent: "center" }}>Save Expense</BtnPrimary>
      </div>
    </Sheet>
  );
}

// ─── App Root ─────────────────────────────────────────────────────────────────
export default function App() {
  const [trips, setTrips] = useState(MOCK_TRIPS);
  const [screen, setScreen] = useState("login");
  const [activeTrip, setActiveTrip] = useState(null);
  const [showExpense, setShowExpense] = useState(false);

  function selectTrip(t) { setActiveTrip(t); setScreen("detail"); }
  function handleCreate(data) {
    const t = {
      id: Date.now(), flag: "🌍",
      unsplashQuery: data.destination,
      fallbackBg: "linear-gradient(135deg, #2A4858 0%, #1A3A3A 100%)",
      status: "upcoming", members: ["You"], itinerary: [], expenses: [],
      ...data,
    };
    setTrips(ts => [t, ...ts]);
    selectTrip(t);
  }
  function handleExpense(form) {
    const exp = { id: Date.now(), category: form.category, amount: Number(form.amount), description: form.description, date: form.date, paidBy: form.paidBy, itineraryId: form.itineraryId ? Number(form.itineraryId) : null };
    const updated = { ...activeTrip, expenses: [...activeTrip.expenses, exp] };
    setActiveTrip(updated);
    setTrips(ts => ts.map(t => t.id === activeTrip.id ? updated : t));
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@300;400;500;600&display=swap');
        * { margin:0; padding:0; box-sizing:border-box; }
        body { background: #F5F0E8; }
        input[type=date]::-webkit-calendar-picker-indicator { opacity:0.4; cursor:pointer; }
        select option { background:#fff; }
        ::-webkit-scrollbar { width:0; }
      `}</style>
      <div style={{ maxWidth: 960, margin: "0 auto", minHeight: "100vh", background: C.sand, fontFamily: "'DM Sans', sans-serif", color: C.ink }}>
        {screen === "login"   && <LoginScreen onLogin={() => setScreen("trips")} />}
        {screen === "trips"   && <TripsScreen trips={trips} onSelect={selectTrip} onNew={() => setScreen("newTrip")} />}
        {screen === "newTrip" && <NewTripScreen onBack={() => setScreen("trips")} onCreate={handleCreate} />}
        {screen === "detail" && activeTrip && <>
          <TripDetailScreen trip={activeTrip} onBack={() => setScreen("trips")} onAddExpense={() => setShowExpense(true)} />
          <ExpenseSheet open={showExpense} onClose={() => setShowExpense(false)} trip={activeTrip} onSave={handleExpense} />
        </>}
      </div>
    </>
  );
}
