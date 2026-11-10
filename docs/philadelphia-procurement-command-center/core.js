export const CATEGORIES = ["Professional Services", "Public Works", "Services, Supplies & Equipment", "Concessions", "Other / Unclassified"];
export const STAGES = ["Open", "Forecast", "Executed Listing", "Intent to Contract", "Historical Snapshot", "Closed", "Cancelled", "Deadline Passed", "Unknown"];
export const PIPELINE = ["Open", "Forecast"];
export const PORTFOLIO = ["Executed Listing", "Intent to Contract", "Historical Snapshot"];
export const DEFAULT = {search:"", categories:[], departments:"", stages:PIPELINE, entity:"city", amount:"", geography:"", source:"", sort:"relevance"};
export function filterRecords(records, state) {
  const terms = state.search.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
  return records.filter(r => {
    if (state.categories.length && !state.categories.includes(r.category)) return false;
    if (state.stages.length && !state.stages.includes(r.stage)) return false;
    if (state.departments && r.department !== state.departments) return false;
    if (state.entity === "city" && r.entity !== "City of Philadelphia") return false;
    if (state.entity === "partner" && r.entity !== "Partner Agency") return false;
    if (state.source && r.source_id !== state.source) return false;
    if (state.geography === "mapped" && !r.location) return false;
    if (state.geography === "unlocated" && r.location) return false;
    if (state.geography.startsWith("district-") && r.location?.district !== state.geography.slice(9)) return false;
    const hi = r.amount_high, lo = r.amount_low;
    if (state.amount === "unknown" && hi !== null) return false;
    if (state.amount && state.amount !== "unknown") {
      if (hi === null || lo === null) return false;
      if (state.amount === "under100k" && lo >= 100000) return false;
      if (state.amount === "100k1m" && (hi < 100000 || lo > 1000000)) return false;
      if (state.amount === "over1m" && hi < 1000000) return false;
    }
    if (terms.length) {
      const haystack = [r.title,r.description,r.department,r.reference,r.vendor,r.category,r.service_type,r.subcontracting,...r.codes].join(" ").toLocaleLowerCase();
      if (!terms.every(term => haystack.includes(term))) return false;
    }
    return true;
  });
}
export function sortRecords(records, sort) {
  return [...records].sort((a,b) => {
    if (sort === "due") return (a.due || "9999").localeCompare(b.due || "9999") || a.id.localeCompare(b.id);
    if (sort === "newest") return (b.posted || "").localeCompare(a.posted || "") || a.id.localeCompare(b.id);
    if (sort === "value") return (b.amount_high ?? -Infinity) - (a.amount_high ?? -Infinity) || a.id.localeCompare(b.id);
    if (sort === "department") return a.department.localeCompare(b.department) || a.title.localeCompare(b.title);
    const order = {Open:0,Forecast:1,"Executed Listing":2,"Intent to Contract":3,"Historical Snapshot":4,Closed:5,"Deadline Passed":6,Cancelled:7,Unknown:8};
    const stageOrder=(order[a.stage] ?? 9) - (order[b.stage] ?? 9);
    if(stageOrder)return stageOrder;
    if(a.stage === 'Executed Listing')return (b.start || '').localeCompare(a.start || '') || (b.end || '').localeCompare(a.end || '') || a.id.localeCompare(b.id);
    if(a.stage === 'Intent to Contract')return (b.posted || '').localeCompare(a.posted || '') || a.id.localeCompare(b.id);
    return (a.due || a.anticipated || "9999").localeCompare(b.due || b.anticipated || "9999") || a.id.localeCompare(b.id);
  });
}
export function daysUntil(date, asOf) {
  if (!date) return null;
  return Math.round((Date.parse(date+"T12:00:00Z") - Date.parse(asOf+"T12:00:00Z")) / 86400000);
}
export function summarize(records, asOf) {
  return {
    total:records.length,
    open:records.filter(r=>r.stage === "Open").length,
    forecast:records.filter(r=>r.stage === "Forecast").length,
    contract:records.filter(r=>["Executed Listing","Historical Snapshot"].includes(r.stage)).length,
    intent:records.filter(r=>r.stage === "Intent to Contract").length,
    due30:records.filter(r=>r.stage === "Open" && daysUntil(r.due,asOf) !== null && daysUntil(r.due,asOf) >= 0 && daysUntil(r.due,asOf) <= 30).length,
    mapped:records.filter(r=>r.location).length,
    known:records.filter(r=>r.amount_high !== null).length,
    professional:records.filter(r=>r.category === "Professional Services").length,
    departments:new Set(records.map(r=>r.department)).size,
  };
}
export function groupCounts(records, key) {
  const groups = new Map();
  for (const r of records) groups.set(r[key], (groups.get(r[key]) || 0)+1);
  return [...groups].sort((a,b)=>b[1]-a[1]);
}
export function exportCSV(records) {
  const columns = ["reference","title","category","department","stage","entity","vendor","posted","due","anticipated","start","end","amount_low","amount_high","amount_basis","source","source_url","snapshot"];
  const cell = value => {
    let s = value == null ? "" : String(value);
    if (/^[\s]*[=+\-@]/.test(s)) s = "'"+s;
    return '"'+s.replaceAll('"','""')+'"';
  };
  return "\ufeff" + [columns, ...records.map(r=>columns.map(c=>r[c]))].map(row=>row.map(cell).join(",")).join("\r\n");
}
