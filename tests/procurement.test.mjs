import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,access} from 'node:fs/promises';
import {gunzipSync} from 'node:zlib';
import {CATEGORIES,DEFAULT,filterRecords,sortRecords,summarize,exportCSV,daysUntil} from '../src/procurement/core.js';

const data=JSON.parse(gunzipSync(await readFile(new URL('../src/procurement/data/records.json.gz',import.meta.url))));
const all={...DEFAULT,stages:[],entity:'all'};

test('Every procurement source count reconciles without duplicating the Hub feed',()=>{
  assert.equal(new Set(data.records.map(r=>r.id)).size,data.records.length);
  for(const s of data.sources.filter(s=>data.records.some(r=>r.source_id===s.id)))assert.equal(data.records.filter(r=>r.source_id===s.id).length,s.count,s.id);
  assert.equal(data.records.filter(r=>r.source_id==='hub').length,0);
  assert.equal(data.records.filter(r=>r.source_id==='phl-open').length,new Set(data.records.filter(r=>r.source_id==='phl-open').map(r=>r.reference)).size);
  assert.ok(data.records.every(r=>r.source_url.startsWith('https://')&&CATEGORIES.includes(r.category)));
});

test('Professional Services and Public Works can be selected simultaneously',()=>{
  const a=filterRecords(data.records,{...DEFAULT,categories:['Professional Services']});
  const b=filterRecords(data.records,{...DEFAULT,categories:['Public Works']});
  const combined=filterRecords(data.records,{...DEFAULT,categories:['Professional Services','Public Works']});
  assert.ok(a.length>0&&b.length>0);
  assert.equal(combined.length,a.length+b.length);
  assert.ok(combined.every(r=>['Professional Services','Public Works'].includes(r.category)));
});

test('City-only scope excludes partner agencies without dropping them from the dataset',()=>{
  const city=filterRecords(data.records,DEFAULT);
  const expanded=filterRecords(data.records,{...DEFAULT,entity:'all'});
  const partner=filterRecords(data.records,{...DEFAULT,entity:'partner'});
  assert.ok(partner.length>0);
  assert.equal(expanded.length,city.length+partner.length);
  assert.ok(city.every(r=>r.entity==='City of Philadelphia'));
});

test('Unknown values, reported zeros, and overlapping cost bands retain their meanings',()=>{
  const base={...data.records[0],stage:'Open',category:'Professional Services',entity:'City of Philadelphia',location:null};
  const rows=[{...base,id:'unknown',amount_low:null,amount_high:null},{...base,id:'zero',amount_low:0,amount_high:0},{...base,id:'range',amount_low:250000,amount_high:1000000}];
  assert.deepEqual(filterRecords(rows,{...DEFAULT,amount:'unknown'}).map(r=>r.id),['unknown']);
  assert.deepEqual(filterRecords(rows,{...DEFAULT,amount:'under100k'}).map(r=>r.id),['zero']);
  assert.deepEqual(filterRecords(rows,{...DEFAULT,amount:'100k1m'}).map(r=>r.id),['range']);
  assert.deepEqual(filterRecords(rows,{...DEFAULT,amount:'over1m'}).map(r=>r.id),['range']);
});

test('Unlocated records remain searchable and district filtering only uses supported locations',()=>{
  const located=filterRecords(data.records,{...all,geography:'mapped'});
  const unlocated=filterRecords(data.records,{...all,geography:'unlocated'});
  assert.equal(located.length+unlocated.length,data.records.length);
  assert.ok(located.length>0&&unlocated.length>located.length);
  const district4=filterRecords(data.records,{...all,geography:'district-4'});
  assert.ok(district4.length>0);
  assert.ok(district4.every(r=>r.location?.district==='4'));
  assert.ok(located.every(r=>r.location.source_url==='https://www.phila.gov/capital-projects-finder/'&&r.location.lon<0&&r.location.lat>0));
});

test('Urgency measures use open opportunities and a fixed snapshot date',()=>{
  assert.equal(daysUntil('2026-11-10','2026-11-10'),0);
  assert.equal(daysUntil('2026-11-09','2026-11-10'),-1);
  assert.equal(daysUntil(null,'2026-11-10'),null);
  const base=data.records[0];
  const rows=[{...base,stage:'Open',due:'2026-11-10'},{...base,stage:'Forecast',due:'2026-11-11'},{...base,stage:'Closed',due:'2026-11-11'},{...base,stage:'Open',due:'2026-11-09'},{...base,stage:'Open',due:null}];
  assert.equal(summarize(rows,'2026-11-10').due30,1);
});

test('CSV export preserves source provenance and neutralizes formula-like text',()=>{
  const csv=exportCSV([{...data.records[0],title:'=HYPERLINK("https://example.org")',vendor:'A, B & C',reference:'000123'}]);
  assert.ok(csv.includes('"\'=HYPERLINK(""https://example.org"")"'));
  assert.ok(csv.includes('"A, B & C"'));
  assert.ok(csv.includes('"000123"'));
  assert.ok(csv.includes('source_url'));
  assert.ok(csv.includes(data.records[0].source_url));
});

test('All-record sorting is stable and published values do not treat unknown as zero',()=>{
  const ordered=sortRecords(data.records,'value');
  const firstUnknown=ordered.findIndex(r=>r.amount_high===null);
  assert.ok(firstUnknown>0);
  assert.ok(ordered.slice(firstUnknown).every(r=>r.amount_high===null));
  const executed=sortRecords(data.records.filter(r=>r.stage==='Executed Listing'),'relevance');
  assert.equal(executed[0].start,[...executed].map(r=>r.start||'').sort().at(-1));
  assert.deepEqual(sortRecords(data.records,'relevance').map(r=>r.id),sortRecords(data.records,'relevance').map(r=>r.id));
});

test('Both Insights categories retain the correct demo and white-paper routes',async()=>{
  const html=await readFile(new URL('../docs/insights/index.html',import.meta.url),'utf8');
  const finance=html.slice(html.indexOf('<span>Finance & Advisory</span>'),html.indexOf('<span>Analytics & Business Intelligence</span>'));
  const analytics=html.slice(html.indexOf('<span>Analytics & Business Intelligence</span>'),html.indexOf('<span>Nonprofit & Compliance</span>'));
  assert.ok(finance.includes('../corporate-finance-command-center/'));
  assert.ok(finance.includes('../case-studies/corporate-finance-decision-command-center/'));
  assert.ok(analytics.includes('../philadelphia-procurement-command-center/'));
  assert.ok(analytics.includes('../philadelphia-procurement-command-center/white-paper/'));
  assert.ok(!analytics.includes('../corporate-finance-command-center/'));
  await access(new URL('../docs/corporate-finance-command-center/phase08.js',import.meta.url));
  await access(new URL('../docs/case-studies/corporate-finance-decision-command-center/index.html',import.meta.url));
  const paper=await readFile(new URL('../docs/philadelphia-procurement-command-center/white-paper/index.html',import.meta.url),'utf8');
  assert.ok(!paper.includes('{{'));
});
