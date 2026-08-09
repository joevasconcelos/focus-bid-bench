import { useState, useMemo, useRef } from "react";

// ---------- helpers ----------
const uid = () => Math.random().toString(36).slice(2, 9);
const money = (n) =>
  (Number(n) || 0).toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const todayISO = () => new Date().toISOString().slice(0, 10);
const fmtDate = (iso) => {
  if (!iso) return "TBD";
  const d = new Date(iso + "T00:00:00");
  if (isNaN(d)) return iso;
  return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
};

const STYLE_PRESETS = {
  formal: { name: "Formal Navy", ink: "#1E2430", accent: "#A67C3D", accentSoft: "#EFE6D6", line: "#DDD6C9" },
  modern: { name: "Modern Teal", ink: "#132524", accent: "#2F7469", accentSoft: "#DDEDE9", line: "#D6E4E1" },
  minimal: { name: "Minimal Mono", ink: "#1B1B1B", accent: "#3A3A3A", accentSoft: "#EDEDED", line: "#DCDCDC" },
};

const DEFAULT_DATA = {
  agency: {
    name: "Meridian Field Research",
    tagline: "Qualitative insight, precisely fielded.",
    contact: "Joe Alvarez",
    title: "Director, Client Services",
    email: "joe@meridianfield.com",
    phone: "(818) 555-0142",
  },
  client: {
    company: "",
    contact: "",
    projectTitle: "",
    date: todayISO(),
    refNumber: "MFR-" + new Date().getFullYear() + "-" + Math.floor(1000 + Math.random() * 9000),
    background: "",
  },
  methodology: {
    studyType: "In-person focus groups",
    numGroups: 6,
    respondentsPerGroup: 8,
    sessionLength: 90,
    numMarkets: 2,
    moderatorNotes: "",
  },
  sample: {
    targetAudience: "",
    screeningCriteria: "",
    incidenceRate: 50,
    recruitMethod: "Consumer panel database",
    overRecruitPct: 20,
    honorarium: 100,
  },
  facility: {
    type: "Research facility with client viewing room",
    locations: "",
    viewingRoom: true,
    recording: true,
    translation: false,
    translationLang: "",
  },
  timeline: {
    milestones: [
      { id: uid(), label: "RFP response due", date: "" },
      { id: uid(), label: "Recruiting begins", date: "" },
      { id: uid(), label: "Fielding dates", date: "" },
      { id: uid(), label: "Topline report delivery", date: "" },
      { id: uid(), label: "Final report delivery", date: "" },
    ],
  },
  deliverables: {
    topline: true,
    fullReport: true,
    videoHighlights: false,
    transcripts: false,
    bannerTables: false,
    recordings: true,
    debrief: true,
    presentation: false,
  },
  pricing: {
    items: [
      { id: uid(), label: "Participant recruitment", amount: 0 },
      { id: uid(), label: "Facility rental", amount: 0 },
      { id: uid(), label: "Respondent incentives", amount: 0 },
      { id: uid(), label: "Moderation", amount: 0 },
      { id: uid(), label: "Project management & reporting", amount: 0 },
    ],
    showItemized: true,
    notes: "",
  },
  terms: {
    paymentTerms: "50% deposit due upon signed agreement; remaining balance due upon delivery of final report.",
    cancellationPolicy: "Cancellations within 10 business days of fielding are subject to full recruitment and facility costs.",
    quoteValidity: "30 days from date of issue",
    additionalNotes: "",
  },
  customization: {
    template: "formal",
    includeCoverPage: true,
    includeTerms: true,
    includeAppendix: true,
  },
};

const DELIVERABLE_LABELS = {
  topline: "Topline findings summary",
  fullReport: "Full written report",
  videoHighlights: "Video highlight reel",
  transcripts: "Verbatim transcripts",
  bannerTables: "Banner / crosstab tables",
  recordings: "Session audio/video recordings",
  debrief: "Live moderator debrief",
  presentation: "In-person findings presentation",
};

const TABS = [
  { id: "agency", label: "Your Company" },
  { id: "client", label: "Client & Project" },
  { id: "methodology", label: "Methodology" },
  { id: "sample", label: "Sample & Recruiting" },
  { id: "facility", label: "Facility & Logistics" },
  { id: "timeline", label: "Timeline" },
  { id: "deliverables", label: "Deliverables" },
  { id: "pricing", label: "Investment" },
  { id: "terms", label: "Terms" },
  { id: "style", label: "Output Style" },
];

// ---------- small UI atoms ----------
function Field({ label, hint, children }) {
  return (
    <label className="block mb-4">
      <span className="block text-[11px] font-semibold tracking-wide uppercase text-[#5B6472] mb-1.5">{label}</span>
      {children}
      {hint && <span className="block text-xs text-[#8B8FA0] mt-1">{hint}</span>}
    </label>
  );
}

const inputCls =
  "w-full rounded-md border border-[#DDD6C9] bg-white px-3 py-2 text-sm text-[#1E2430] placeholder-[#A9AEBC] focus:outline-none focus:ring-2 focus:ring-[#A67C3D]/40 focus:border-[#A67C3D] transition";
const textareaCls = inputCls + " min-h-[84px] resize-y leading-relaxed";

function TextInput(props) {
  return <input {...props} className={inputCls} />;
}
function TextArea(props) {
  return <textarea {...props} className={textareaCls} />;
}
function Select({ children, ...props }) {
  return (
    <select {...props} className={inputCls + " appearance-none bg-[url('data:image/svg+xml,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20viewBox=%220%200%2020%2020%22%20fill=%22%235B6472%22%3E%3Cpath%20d=%22M5.5%207.5l4.5%205%204.5-5%22%20stroke=%22%235B6472%22%20stroke-width=%221.4%22%20fill=%22none%22%20stroke-linecap=%22round%22%20stroke-linejoin=%22round%22/%3E%3C/svg%3E')] bg-no-repeat bg-[right_10px_center]"}>
      {children}
    </select>
  );
}
function Toggle({ checked, onChange, label }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex items-center gap-2.5 text-left group"
    >
      <span
        className={
          "relative inline-flex h-5 w-9 shrink-0 rounded-full transition-colors " +
          (checked ? "bg-[#A67C3D]" : "bg-[#DDD6C9]")
        }
      >
        <span
          className={
            "absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform " +
            (checked ? "translate-x-4" : "translate-x-0.5")
          }
        />
      </span>
      <span className="text-sm text-[#1E2430]">{label}</span>
    </button>
  );
}

// ---------- document generation (plain text, for copy/download) ----------
function buildPlainText(data, total) {
  const L = [];
  const rule = "----------------------------------------------------------------";
  const { agency, client, methodology, sample, facility, timeline, deliverables, pricing, terms, customization } = data;

  if (customization.includeCoverPage) {
    L.push(agency.name.toUpperCase());
    if (agency.tagline) L.push(agency.tagline);
    L.push("");
    L.push(`PROPOSAL: ${client.projectTitle || "Qualitative Research Project"}`);
    L.push(`Prepared for: ${client.company || "[Client Company]"}`);
    if (client.contact) L.push(`Attention: ${client.contact}`);
    L.push(`Date: ${fmtDate(client.date)}`);
    L.push(`Reference: ${client.refNumber}`);
    L.push(rule);
    L.push("");
  }

  L.push("1. PROJECT BACKGROUND & OBJECTIVES");
  L.push(client.background || "[Background and research objectives to be summarized here.]");
  L.push("");

  L.push("2. PROPOSED METHODOLOGY");
  L.push(`Approach: ${methodology.studyType}`);
  L.push(`Sessions: ${methodology.numGroups} groups x ${methodology.respondentsPerGroup} respondents (${methodology.sessionLength} minutes each)`);
  L.push(`Markets: ${methodology.numMarkets}`);
  if (methodology.moderatorNotes) L.push(`Moderation notes: ${methodology.moderatorNotes}`);
  L.push("");

  L.push("3. TARGET AUDIENCE & RECRUITMENT");
  L.push(`Target audience: ${sample.targetAudience || "[TBD]"}`);
  if (sample.screeningCriteria) L.push(`Screening criteria: ${sample.screeningCriteria}`);
  L.push(`Estimated incidence rate: ${sample.incidenceRate}%`);
  L.push(`Recruitment method: ${sample.recruitMethod}`);
  L.push(`Over-recruit: ${sample.overRecruitPct}%`);
  L.push(`Respondent honorarium: ${money(sample.honorarium)} per respondent`);
  L.push("");

  L.push("4. FACILITY & LOGISTICS");
  L.push(`Facility type: ${facility.type}`);
  if (facility.locations) L.push(`Locations: ${facility.locations}`);
  L.push(`Client viewing room: ${facility.viewingRoom ? "Included" : "Not included"}`);
  L.push(`Recording: ${facility.recording ? "Included" : "Not included"}`);
  if (facility.translation) L.push(`Translation/interpretation: ${facility.translationLang || "Provided"}`);
  L.push("");

  L.push("5. PROJECT TIMELINE");
  timeline.milestones.forEach((m) => L.push(`${m.label}: ${fmtDate(m.date)}`));
  L.push("");

  L.push("6. DELIVERABLES");
  Object.entries(deliverables).forEach(([k, v]) => {
    if (v) L.push(`- ${DELIVERABLE_LABELS[k]}`);
  });
  L.push("");

  L.push("7. INVESTMENT");
  if (pricing.showItemized) {
    pricing.items.forEach((i) => L.push(`${i.label}: ${money(i.amount)}`));
    L.push(`TOTAL: ${money(total)}`);
  } else {
    L.push(`Total project investment: ${money(total)}`);
  }
  if (pricing.notes) L.push(pricing.notes);
  L.push("");

  if (customization.includeTerms) {
    L.push("8. TERMS & CONDITIONS");
    L.push(`Payment terms: ${terms.paymentTerms}`);
    if (terms.cancellationPolicy) L.push(`Cancellation policy: ${terms.cancellationPolicy}`);
    L.push(`Quote validity: ${terms.quoteValidity}`);
    if (terms.additionalNotes) L.push(terms.additionalNotes);
    L.push("");
  }

  if (customization.includeAppendix) {
    L.push("ABOUT " + agency.name.toUpperCase());
    if (agency.tagline) L.push(agency.tagline);
    L.push("");
  }

  L.push(rule);
  L.push(`Prepared by ${agency.contact}${agency.title ? ", " + agency.title : ""}`);
  L.push(`${agency.email}${agency.phone ? " | " + agency.phone : ""}`);

  return L.join("\n");
}

function buildHTML(data, total, palette) {
  const { agency, client, methodology, sample, facility, timeline, deliverables, pricing, terms, customization } = data;
  const active = Object.entries(deliverables).filter(([, v]) => v).map(([k]) => DELIVERABLE_LABELS[k]);

  const section = (num, title, body) => `
    <section style="margin-bottom:34px;">
      <h2 style="font-family:'Source Serif 4',Georgia,serif;font-size:15px;letter-spacing:.04em;text-transform:uppercase;color:${palette.accent};border-bottom:1px solid ${palette.line};padding-bottom:8px;margin:0 0 14px;">
        ${num ? num + ". " : ""}${title}
      </h2>
      ${body}
    </section>`;

  const p = (t) => `<p style="margin:0 0 10px;color:${palette.ink};font-size:14.5px;line-height:1.65;">${t || ""}</p>`;
  const kv = (rows) =>
    `<table style="width:100%;border-collapse:collapse;font-size:14px;">${rows
      .map(
        (r) =>
          `<tr><td style="padding:6px 12px 6px 0;color:#5B6472;width:220px;vertical-align:top;">${r[0]}</td><td style="padding:6px 0;color:${palette.ink};">${r[1]}</td></tr>`
      )
      .join("")}</table>`;

  const milestoneRows = timeline.milestones
    .map((m) => `<tr><td style="padding:8px 12px 8px 0;color:${palette.ink};">${m.label}</td><td style="padding:8px 0;color:#5B6472;text-align:right;">${fmtDate(m.date)}</td></tr>`)
    .join("");

  const deliverableRows = active
    .map((d) => `<li style="padding:5px 0;color:${palette.ink};">${d}</li>`)
    .join("");

  const pricingRows = pricing.showItemized
    ? pricing.items
        .map(
          (i) =>
            `<tr><td style="padding:8px 12px 8px 0;color:${palette.ink};border-bottom:1px solid ${palette.line};">${i.label}</td><td style="padding:8px 0;text-align:right;color:${palette.ink};border-bottom:1px solid ${palette.line};">${money(i.amount)}</td></tr>`
        )
        .join("")
    : "";

  return `<!doctype html>
<html><head><meta charset="utf-8"><title>${client.projectTitle || "Research Proposal"}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Source+Serif+4:wght@400;600;700&family=IBM+Plex+Sans:wght@400;500;600&display=swap');
  body{font-family:'IBM Plex Sans',Arial,sans-serif;background:#F3F1EC;margin:0;padding:40px 0;}
  .page{max-width:740px;margin:0 auto;background:#fff;padding:56px 60px;box-shadow:0 1px 4px rgba(0,0,0,.08);}
</style></head>
<body><div class="page">
  ${
    customization.includeCoverPage
      ? `
  <div style="border-bottom:2px solid ${palette.accent};padding-bottom:24px;margin-bottom:36px;">
    <div style="font-family:'Source Serif 4',serif;font-size:22px;font-weight:700;color:${palette.ink};">${agency.name}</div>
    ${agency.tagline ? `<div style="color:#8B8FA0;font-size:13px;margin-top:2px;">${agency.tagline}</div>` : ""}
    <div style="margin-top:28px;font-family:'Source Serif 4',serif;font-size:28px;color:${palette.ink};">${client.projectTitle || "Qualitative Research Proposal"}</div>
    <div style="margin-top:14px;">${kv([
      ["Prepared for", client.company || "&mdash;"],
      client.contact ? ["Attention", client.contact] : null,
      ["Date", fmtDate(client.date)],
      ["Reference", client.refNumber],
    ].filter(Boolean))}</div>
  </div>`
      : ""
  }
  ${section("1", "Project Background &amp; Objectives", p(client.background || "Background and research objectives to be summarized here."))}
  ${section("2", "Proposed Methodology", kv([
    ["Approach", methodology.studyType],
    ["Sessions", `${methodology.numGroups} groups &times; ${methodology.respondentsPerGroup} respondents (${methodology.sessionLength} min each)`],
    ["Markets", methodology.numMarkets],
  ]) + (methodology.moderatorNotes ? p(methodology.moderatorNotes) : ""))}
  ${section("3", "Target Audience &amp; Recruitment", kv([
    ["Target audience", sample.targetAudience || "&mdash;"],
    sample.screeningCriteria ? ["Screening criteria", sample.screeningCriteria] : null,
    ["Estimated incidence", sample.incidenceRate + "%"],
    ["Recruitment method", sample.recruitMethod],
    ["Over-recruit", sample.overRecruitPct + "%"],
    ["Respondent honorarium", money(sample.honorarium) + " per respondent"],
  ].filter(Boolean)))}
  ${section("4", "Facility &amp; Logistics", kv([
    ["Facility type", facility.type],
    facility.locations ? ["Locations", facility.locations] : null,
    ["Client viewing room", facility.viewingRoom ? "Included" : "Not included"],
    ["Recording", facility.recording ? "Included" : "Not included"],
    facility.translation ? ["Translation", facility.translationLang || "Provided"] : null,
  ].filter(Boolean)))}
  ${section("5", "Project Timeline", `<table style="width:100%;border-collapse:collapse;">${milestoneRows}</table>`)}
  ${section("6", "Deliverables", `<ul style="margin:0;padding-left:18px;">${deliverableRows}</ul>`)}
  ${section("7", "Investment", pricing.showItemized
    ? `<table style="width:100%;border-collapse:collapse;">${pricingRows}<tr><td style="padding:12px 12px 0 0;font-weight:600;color:${palette.ink};">Total</td><td style="padding:12px 0 0;text-align:right;font-weight:700;color:${palette.accent};font-size:17px;">${money(total)}</td></tr></table>${pricing.notes ? p(pricing.notes) : ""}`
    : `<div style="font-size:20px;font-weight:700;color:${palette.accent};">${money(total)} total project investment</div>${pricing.notes ? p(pricing.notes) : ""}`
  )}
  ${customization.includeTerms ? section("8", "Terms &amp; Conditions", kv([
    ["Payment terms", terms.paymentTerms],
    terms.cancellationPolicy ? ["Cancellation policy", terms.cancellationPolicy] : null,
    ["Quote validity", terms.quoteValidity],
  ].filter(Boolean)) + (terms.additionalNotes ? p(terms.additionalNotes) : "")) : ""}
  ${customization.includeAppendix ? section("", "About " + agency.name, p(agency.tagline)) : ""}
  <div style="margin-top:40px;padding-top:20px;border-top:1px solid ${palette.line};color:#8B8FA0;font-size:13px;">
    Prepared by ${agency.contact}${agency.title ? ", " + agency.title : ""}<br/>${agency.email}${agency.phone ? " &middot; " + agency.phone : ""}
  </div>
</div></body></html>`;
}

// ---------- main app ----------
export default function BidBench() {
  const [data, setData] = useState(DEFAULT_DATA);
  const [tab, setTab] = useState("client");
  const [copied, setCopied] = useState(false);
  const previewRef = useRef(null);

  const update = (section, field, value) =>
    setData((d) => ({ ...d, [section]: { ...d[section], [field]: value } }));

  const total = useMemo(
    () => data.pricing.items.reduce((s, i) => s + (Number(i.amount) || 0), 0),
    [data.pricing.items]
  );
  const palette = STYLE_PRESETS[data.customization.template];

  const addMilestone = () =>
    setData((d) => ({
      ...d,
      timeline: { milestones: [...d.timeline.milestones, { id: uid(), label: "New milestone", date: "" }] },
    }));
  const removeMilestone = (id) =>
    setData((d) => ({ ...d, timeline: { milestones: d.timeline.milestones.filter((m) => m.id !== id) } }));
  const updateMilestone = (id, field, value) =>
    setData((d) => ({
      ...d,
      timeline: { milestones: d.timeline.milestones.map((m) => (m.id === id ? { ...m, [field]: value } : m)) },
    }));

  const addPricingItem = () =>
    setData((d) => ({ ...d, pricing: { ...d.pricing, items: [...d.pricing.items, { id: uid(), label: "New line item", amount: 0 }] } }));
  const removePricingItem = (id) =>
    setData((d) => ({ ...d, pricing: { ...d.pricing, items: d.pricing.items.filter((i) => i.id !== id) } }));
  const updatePricingItem = (id, field, value) =>
    setData((d) => ({
      ...d,
      pricing: { ...d.pricing, items: d.pricing.items.map((i) => (i.id === id ? { ...i, [field]: value } : i)) },
    }));

  const handleCopy = async () => {
    const text = buildPlainText(data, total);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard unavailable */
    }
  };

  const handleDownload = () => {
    const html = buildHTML(data, total, palette);
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const safeName = (data.client.projectTitle || "focus-group-proposal").toLowerCase().replace(/[^a-z0-9]+/g, "-");
    a.href = url;
    a.download = `${safeName}.html`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    if (confirm("Clear all fields and start a new bid?")) {
      setData({ ...DEFAULT_DATA, client: { ...DEFAULT_DATA.client, date: todayISO(), refNumber: "MFR-" + new Date().getFullYear() + "-" + Math.floor(1000 + Math.random() * 9000) } });
      setTab("client");
    }
  };

  return (
    <div className="min-h-full w-full bg-[#F3F1EC] font-['IBM_Plex_Sans',sans-serif]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Source+Serif+4:wght@400;600;700&family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500&display=swap');
        .plex-sans { font-family: 'IBM Plex Sans', ui-sans-serif, sans-serif; }
        .plex-mono { font-family: 'IBM Plex Mono', monospace; }
        .serif-doc { font-family: 'Source Serif 4', Georgia, serif; }
      `}</style>

      {/* top bar */}
      <div className="sticky top-0 z-20 border-b border-[#DDD6C9] bg-[#F3F1EC]/95 backdrop-blur px-5 py-3.5 flex items-center justify-between gap-3">
        <div className="flex items-baseline gap-2.5">
          <span className="serif-doc text-[19px] font-semibold text-[#1E2430]">Bid Bench</span>
          <span className="plex-mono text-[11px] text-[#8B8FA0]">focus group RFP builder</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="text-xs font-medium text-[#8B8FA0] hover:text-[#5B6472] px-2.5 py-1.5 transition"
          >
            New bid
          </button>
          <button
            onClick={handleCopy}
            className="text-xs font-medium border border-[#DDD6C9] text-[#1E2430] hover:border-[#A67C3D] rounded-md px-3 py-1.5 transition"
          >
            {copied ? "Copied ✓" : "Copy text"}
          </button>
          <button
            onClick={handleDownload}
            className="text-xs font-semibold text-white rounded-md px-3.5 py-1.5 transition shadow-sm"
            style={{ backgroundColor: palette.accent }}
          >
            Download document
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-0">
        {/* left: form */}
        <div className="border-r border-[#DDD6C9] bg-[#FAF8F4]">
          <nav className="flex lg:flex-col overflow-x-auto lg:overflow-visible border-b lg:border-b-0 border-[#DDD6C9]">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={
                  "text-left px-4 py-3 text-[13px] font-medium whitespace-nowrap lg:whitespace-normal border-b-2 lg:border-b-0 lg:border-l-2 transition " +
                  (tab === t.id
                    ? "border-[#A67C3D] text-[#1E2430] bg-white"
                    : "border-transparent text-[#8B8FA0] hover:text-[#5B6472] hover:bg-white/60")
                }
              >
                {t.label}
              </button>
            ))}
          </nav>

          <div className="p-5 max-w-[420px]">
            {tab === "agency" && (
              <>
                <Field label="Company name"><TextInput value={data.agency.name} onChange={(e) => update("agency", "name", e.target.value)} /></Field>
                <Field label="Tagline / positioning line"><TextInput value={data.agency.tagline} onChange={(e) => update("agency", "tagline", e.target.value)} /></Field>
                <Field label="Preparer name"><TextInput value={data.agency.contact} onChange={(e) => update("agency", "contact", e.target.value)} /></Field>
                <Field label="Preparer title"><TextInput value={data.agency.title} onChange={(e) => update("agency", "title", e.target.value)} /></Field>
                <Field label="Email"><TextInput value={data.agency.email} onChange={(e) => update("agency", "email", e.target.value)} /></Field>
                <Field label="Phone"><TextInput value={data.agency.phone} onChange={(e) => update("agency", "phone", e.target.value)} /></Field>
              </>
            )}

            {tab === "client" && (
              <>
                <Field label="Client company"><TextInput value={data.client.company} onChange={(e) => update("client", "company", e.target.value)} placeholder="Acme Consumer Brands" /></Field>
                <Field label="Client contact"><TextInput value={data.client.contact} onChange={(e) => update("client", "contact", e.target.value)} placeholder="Jane Ortiz, Insights Director" /></Field>
                <Field label="Project title"><TextInput value={data.client.projectTitle} onChange={(e) => update("client", "projectTitle", e.target.value)} placeholder="2026 Packaging Concept Exploration" /></Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Proposal date"><TextInput type="date" value={data.client.date} onChange={(e) => update("client", "date", e.target.value)} /></Field>
                  <Field label="Reference #"><TextInput value={data.client.refNumber} onChange={(e) => update("client", "refNumber", e.target.value)} /></Field>
                </div>
                <Field label="Background & objectives" hint="What the client needs to learn and why."><TextArea value={data.client.background} onChange={(e) => update("client", "background", e.target.value)} /></Field>
              </>
            )}

            {tab === "methodology" && (
              <>
                <Field label="Study type">
                  <Select value={data.methodology.studyType} onChange={(e) => update("methodology", "studyType", e.target.value)}>
                    <option>In-person focus groups</option>
                    <option>Online focus groups</option>
                    <option>Hybrid (in-person + online)</option>
                    <option>In-depth interviews (IDIs)</option>
                    <option>Mixed: groups + IDIs</option>
                  </Select>
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Number of groups"><TextInput type="number" min="1" value={data.methodology.numGroups} onChange={(e) => update("methodology", "numGroups", e.target.value)} /></Field>
                  <Field label="Respondents / group"><TextInput type="number" min="1" value={data.methodology.respondentsPerGroup} onChange={(e) => update("methodology", "respondentsPerGroup", e.target.value)} /></Field>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Session length (min)"><TextInput type="number" min="1" value={data.methodology.sessionLength} onChange={(e) => update("methodology", "sessionLength", e.target.value)} /></Field>
                  <Field label="Number of markets"><TextInput type="number" min="1" value={data.methodology.numMarkets} onChange={(e) => update("methodology", "numMarkets", e.target.value)} /></Field>
                </div>
                <Field label="Moderation notes" hint="Moderator experience, language, specialty needed."><TextArea value={data.methodology.moderatorNotes} onChange={(e) => update("methodology", "moderatorNotes", e.target.value)} /></Field>
              </>
            )}

            {tab === "sample" && (
              <>
                <Field label="Target audience"><TextArea value={data.sample.targetAudience} onChange={(e) => update("sample", "targetAudience", e.target.value)} placeholder="Women 25-45, primary grocery shopper, HHI $60K+" /></Field>
                <Field label="Screening criteria" hint="Key qualifiers / disqualifiers"><TextArea value={data.sample.screeningCriteria} onChange={(e) => update("sample", "screeningCriteria", e.target.value)} /></Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Incidence rate (%)"><TextInput type="number" min="1" max="100" value={data.sample.incidenceRate} onChange={(e) => update("sample", "incidenceRate", e.target.value)} /></Field>
                  <Field label="Over-recruit (%)"><TextInput type="number" min="0" value={data.sample.overRecruitPct} onChange={(e) => update("sample", "overRecruitPct", e.target.value)} /></Field>
                </div>
                <Field label="Recruitment method">
                  <Select value={data.sample.recruitMethod} onChange={(e) => update("sample", "recruitMethod", e.target.value)}>
                    <option>Consumer panel database</option>
                    <option>Facility database</option>
                    <option>Random digit dial (RDD)</option>
                    <option>Social media / intercept</option>
                    <option>Client-provided list</option>
                    <option>Combination of sources</option>
                  </Select>
                </Field>
                <Field label="Respondent honorarium ($)"><TextInput type="number" min="0" value={data.sample.honorarium} onChange={(e) => update("sample", "honorarium", e.target.value)} /></Field>
              </>
            )}

            {tab === "facility" && (
              <>
                <Field label="Facility type">
                  <Select value={data.facility.type} onChange={(e) => update("facility", "type", e.target.value)}>
                    <option>Research facility with client viewing room</option>
                    <option>Online platform (webcam-based)</option>
                    <option>Hybrid facility + remote viewing</option>
                    <option>Client site / mobile facility</option>
                  </Select>
                </Field>
                <Field label="Locations" hint="Cities or facility names, comma separated"><TextInput value={data.facility.locations} onChange={(e) => update("facility", "locations", e.target.value)} placeholder="Los Angeles, Chicago" /></Field>
                <div className="flex flex-col gap-3 mt-2">
                  <Toggle checked={data.facility.viewingRoom} onChange={(v) => update("facility", "viewingRoom", v)} label="Client viewing room included" />
                  <Toggle checked={data.facility.recording} onChange={(v) => update("facility", "recording", v)} label="Audio/video recording included" />
                  <Toggle checked={data.facility.translation} onChange={(v) => update("facility", "translation", v)} label="Translation / interpretation needed" />
                </div>
                {data.facility.translation && (
                  <Field label="Language(s)"><TextInput value={data.facility.translationLang} onChange={(e) => update("facility", "translationLang", e.target.value)} className="mt-3" /></Field>
                )}
              </>
            )}

            {tab === "timeline" && (
              <>
                {data.timeline.milestones.map((m) => (
                  <div key={m.id} className="flex gap-2 items-end mb-3">
                    <div className="flex-1">
                      <span className="block text-[11px] font-semibold tracking-wide uppercase text-[#5B6472] mb-1.5">Milestone</span>
                      <TextInput value={m.label} onChange={(e) => updateMilestone(m.id, "label", e.target.value)} />
                    </div>
                    <div className="w-[150px]">
                      <span className="block text-[11px] font-semibold tracking-wide uppercase text-[#5B6472] mb-1.5">Date</span>
                      <TextInput type="date" value={m.date} onChange={(e) => updateMilestone(m.id, "date", e.target.value)} />
                    </div>
                    <button onClick={() => removeMilestone(m.id)} className="text-[#B5533C] text-xs px-2 py-2" title="Remove">✕</button>
                  </div>
                ))}
                <button onClick={addMilestone} className="text-xs font-medium text-[#A67C3D] hover:underline mt-1">+ Add milestone</button>
              </>
            )}

            {tab === "deliverables" && (
              <div className="flex flex-col gap-3.5">
                {Object.entries(DELIVERABLE_LABELS).map(([key, label]) => (
                  <Toggle key={key} checked={data.deliverables[key]} onChange={(v) => update("deliverables", key, v)} label={label} />
                ))}
              </div>
            )}

            {tab === "pricing" && (
              <>
                <Toggle
                  checked={data.pricing.showItemized}
                  onChange={(v) => setData((d) => ({ ...d, pricing: { ...d.pricing, showItemized: v } }))}
                  label="Show itemized cost breakdown"
                />
                <div className="h-4" />
                {data.pricing.items.map((i) => (
                  <div key={i.id} className="flex gap-2 items-end mb-3">
                    <div className="flex-1">
                      <span className="block text-[11px] font-semibold tracking-wide uppercase text-[#5B6472] mb-1.5">Line item</span>
                      <TextInput value={i.label} onChange={(e) => updatePricingItem(i.id, "label", e.target.value)} />
                    </div>
                    <div className="w-[120px]">
                      <span className="block text-[11px] font-semibold tracking-wide uppercase text-[#5B6472] mb-1.5">Amount</span>
                      <TextInput type="number" min="0" value={i.amount} onChange={(e) => updatePricingItem(i.id, "amount", e.target.value)} />
                    </div>
                    <button onClick={() => removePricingItem(i.id)} className="text-[#B5533C] text-xs px-2 py-2" title="Remove">✕</button>
                  </div>
                ))}
                <button onClick={addPricingItem} className="text-xs font-medium text-[#A67C3D] hover:underline">+ Add line item</button>
                <div className="mt-4 pt-4 border-t border-[#DDD6C9] flex justify-between items-center">
                  <span className="text-sm font-semibold text-[#1E2430]">Total</span>
                  <span className="plex-mono text-lg font-semibold" style={{ color: palette.accent }}>{money(total)}</span>
                </div>
                <Field label="Pricing notes" hint="Travel, taxes, contingencies, exclusions">
                  <TextArea value={data.pricing.notes} onChange={(e) => update("pricing", "notes", e.target.value)} className="mt-3" />
                </Field>
              </>
            )}

            {tab === "terms" && (
              <>
                <Field label="Payment terms"><TextArea value={data.terms.paymentTerms} onChange={(e) => update("terms", "paymentTerms", e.target.value)} /></Field>
                <Field label="Cancellation policy"><TextArea value={data.terms.cancellationPolicy} onChange={(e) => update("terms", "cancellationPolicy", e.target.value)} /></Field>
                <Field label="Quote validity"><TextInput value={data.terms.quoteValidity} onChange={(e) => update("terms", "quoteValidity", e.target.value)} /></Field>
                <Field label="Additional notes"><TextArea value={data.terms.additionalNotes} onChange={(e) => update("terms", "additionalNotes", e.target.value)} /></Field>
              </>
            )}

            {tab === "style" && (
              <>
                <span className="block text-[11px] font-semibold tracking-wide uppercase text-[#5B6472] mb-2">Document style</span>
                <div className="flex flex-col gap-2 mb-5">
                  {Object.entries(STYLE_PRESETS).map(([key, p]) => (
                    <button
                      key={key}
                      onClick={() => update("customization", "template", key)}
                      className={
                        "flex items-center gap-3 px-3 py-2.5 rounded-md border text-left transition " +
                        (data.customization.template === key ? "border-[#1E2430]" : "border-[#DDD6C9] hover:border-[#A9AEBC]")
                      }
                    >
                      <span className="w-4 h-4 rounded-full shrink-0" style={{ backgroundColor: p.accent }} />
                      <span className="text-sm text-[#1E2430]">{p.name}</span>
                    </button>
                  ))}
                </div>
                <span className="block text-[11px] font-semibold tracking-wide uppercase text-[#5B6472] mb-2">Sections to include</span>
                <div className="flex flex-col gap-3">
                  <Toggle checked={data.customization.includeCoverPage} onChange={(v) => update("customization", "includeCoverPage", v)} label="Cover / letterhead block" />
                  <Toggle checked={data.customization.includeTerms} onChange={(v) => update("customization", "includeTerms", v)} label="Terms & conditions section" />
                  <Toggle checked={data.customization.includeAppendix} onChange={(v) => update("customization", "includeAppendix", v)} label="About-us appendix" />
                </div>
              </>
            )}
          </div>
        </div>

        {/* right: live preview */}
        <div className="bg-[#EFECE4] p-6 lg:p-10 flex justify-center">
          <div
            ref={previewRef}
            className="serif-doc w-full max-w-[680px] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.08),0_8px_24px_rgba(30,36,48,0.10)] px-10 py-12 lg:px-14 lg:py-14"
            style={{ color: palette.ink }}
          >
            {data.customization.includeCoverPage && (
              <div className="pb-6 mb-8" style={{ borderBottom: `2px solid ${palette.accent}` }}>
                <div className="text-[21px] font-semibold">{data.agency.name || "Your Company"}</div>
                {data.agency.tagline && <div className="plex-sans text-[12.5px] text-[#8B8FA0] mt-0.5">{data.agency.tagline}</div>}
                <div className="text-[26px] mt-7 leading-tight">{data.client.projectTitle || "Qualitative Research Proposal"}</div>
                <div className="plex-sans text-[13.5px] mt-4 space-y-1.5">
                  <div className="flex gap-3"><span className="text-[#8B8FA0] w-[140px] shrink-0">Prepared for</span><span>{data.client.company || "—"}</span></div>
                  {data.client.contact && <div className="flex gap-3"><span className="text-[#8B8FA0] w-[140px] shrink-0">Attention</span><span>{data.client.contact}</span></div>}
                  <div className="flex gap-3"><span className="text-[#8B8FA0] w-[140px] shrink-0">Date</span><span>{fmtDate(data.client.date)}</span></div>
                  <div className="flex gap-3"><span className="text-[#8B8FA0] w-[140px] shrink-0">Reference</span><span className="plex-mono text-[12.5px]">{data.client.refNumber}</span></div>
                </div>
              </div>
            )}

            <DocSection num="1" title="Project Background & Objectives" palette={palette}>
              <p className="plex-sans text-[14px] leading-relaxed">{data.client.background || "Background and research objectives will appear here as you fill in the Client & Project tab."}</p>
            </DocSection>

            <DocSection num="2" title="Proposed Methodology" palette={palette}>
              <DocRow label="Approach" value={data.methodology.studyType} />
              <DocRow label="Sessions" value={`${data.methodology.numGroups} groups × ${data.methodology.respondentsPerGroup} respondents (${data.methodology.sessionLength} min each)`} />
              <DocRow label="Markets" value={data.methodology.numMarkets} />
              {data.methodology.moderatorNotes && <p className="plex-sans text-[13.5px] mt-2 text-[#5B6472]">{data.methodology.moderatorNotes}</p>}
            </DocSection>

            <DocSection num="3" title="Target Audience & Recruitment" palette={palette}>
              <DocRow label="Target audience" value={data.sample.targetAudience || "—"} />
              {data.sample.screeningCriteria && <DocRow label="Screening criteria" value={data.sample.screeningCriteria} />}
              <DocRow label="Estimated incidence" value={`${data.sample.incidenceRate}%`} />
              <DocRow label="Recruitment method" value={data.sample.recruitMethod} />
              <DocRow label="Over-recruit" value={`${data.sample.overRecruitPct}%`} />
              <DocRow label="Respondent honorarium" value={`${money(data.sample.honorarium)} per respondent`} />
            </DocSection>

            <DocSection num="4" title="Facility & Logistics" palette={palette}>
              <DocRow label="Facility type" value={data.facility.type} />
              {data.facility.locations && <DocRow label="Locations" value={data.facility.locations} />}
              <DocRow label="Client viewing room" value={data.facility.viewingRoom ? "Included" : "Not included"} />
              <DocRow label="Recording" value={data.facility.recording ? "Included" : "Not included"} />
              {data.facility.translation && <DocRow label="Translation" value={data.facility.translationLang || "Provided"} />}
            </DocSection>

            <DocSection num="5" title="Project Timeline" palette={palette}>
              <table className="w-full plex-sans text-[13.5px]">
                <tbody>
                  {data.timeline.milestones.map((m) => (
                    <tr key={m.id} style={{ borderBottom: `1px solid ${palette.line}` }}>
                      <td className="py-2 pr-3">{m.label}</td>
                      <td className="py-2 text-right text-[#5B6472]">{fmtDate(m.date)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </DocSection>

            <DocSection num="6" title="Deliverables" palette={palette}>
              <ul className="plex-sans text-[13.5px] space-y-1.5 pl-4 list-disc">
                {Object.entries(data.deliverables).filter(([, v]) => v).map(([k]) => (
                  <li key={k}>{DELIVERABLE_LABELS[k]}</li>
                ))}
              </ul>
            </DocSection>

            <DocSection num="7" title="Investment" palette={palette}>
              {data.pricing.showItemized ? (
                <table className="w-full plex-sans text-[13.5px]">
                  <tbody>
                    {data.pricing.items.map((i) => (
                      <tr key={i.id} style={{ borderBottom: `1px solid ${palette.line}` }}>
                        <td className="py-2 pr-3">{i.label}</td>
                        <td className="py-2 text-right plex-mono">{money(i.amount)}</td>
                      </tr>
                    ))}
                    <tr>
                      <td className="pt-3 font-semibold">Total</td>
                      <td className="pt-3 text-right font-semibold plex-mono text-[16px]" style={{ color: palette.accent }}>{money(total)}</td>
                    </tr>
                  </tbody>
                </table>
              ) : (
                <div className="plex-mono font-semibold text-[19px]" style={{ color: palette.accent }}>{money(total)} <span className="plex-sans font-normal text-[13px] text-[#5B6472]">total project investment</span></div>
              )}
              {data.pricing.notes && <p className="plex-sans text-[13px] text-[#5B6472] mt-2">{data.pricing.notes}</p>}
            </DocSection>

            {data.customization.includeTerms && (
              <DocSection num="8" title="Terms & Conditions" palette={palette}>
                <DocRow label="Payment terms" value={data.terms.paymentTerms} />
                {data.terms.cancellationPolicy && <DocRow label="Cancellation policy" value={data.terms.cancellationPolicy} />}
                <DocRow label="Quote validity" value={data.terms.quoteValidity} />
                {data.terms.additionalNotes && <p className="plex-sans text-[13px] text-[#5B6472] mt-2">{data.terms.additionalNotes}</p>}
              </DocSection>
            )}

            {data.customization.includeAppendix && (
              <DocSection title={`About ${data.agency.name || "Us"}`} palette={palette}>
                <p className="plex-sans text-[13.5px] text-[#5B6472]">{data.agency.tagline}</p>
              </DocSection>
            )}

            <div className="plex-sans text-[12.5px] text-[#8B8FA0] pt-5 mt-2" style={{ borderTop: `1px solid ${palette.line}` }}>
              Prepared by {data.agency.contact || "—"}{data.agency.title ? `, ${data.agency.title}` : ""}
              <br />
              {data.agency.email}{data.agency.phone ? ` · ${data.agency.phone}` : ""}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DocSection({ num, title, palette, children }) {
  return (
    <section className="mb-8">
      <h2
        className="plex-sans text-[13px] font-semibold tracking-wide uppercase pb-2 mb-3.5"
        style={{ color: palette.accent, borderBottom: `1px solid ${palette.line}` }}
      >
        {num ? `${num}. ` : ""}{title}
      </h2>
      {children}
    </section>
  );
}

function DocRow({ label, value }) {
  return (
    <div className="flex gap-3 py-1 plex-sans text-[13.5px]">
      <span className="text-[#8B8FA0] w-[170px] shrink-0">{label}</span>
      <span className="flex-1">{value}</span>
    </div>
  );
}
