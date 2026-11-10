import {CATEGORIES,STAGES,PIPELINE,PORTFOLIO,DEFAULT,filterRecords,sortRecords,summarize,groupCounts,daysUntil,exportCSV} from './core.js';

const $ = id => document.getElementById(id);
const esc = s => String(s ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const number = n => new Intl.NumberFormat('en-US').format(n);
const shortMoney = n => n === null ? 'Not Published' : new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',notation:'compact',maximumFractionDigits:1}).format(n);
const displayDate = d => d ? new Intl.DateTimeFormat('en-US',{month:'short',day:'numeric',year:'numeric',timeZone:'UTC'}).format(new Date(d+'T12:00:00Z')) : 'Not Published';
const monthDate = d => d ? new Intl.DateTimeFormat('en-US',{month:'short',year:'numeric',timeZone:'UTC'}).format(new Date(d+'T12:00:00Z')) : 'Timing TBD';
const moneyLabel = r => r.amount_high === null ? 'Not Published' : r.amount_low === r.amount_high ? shortMoney(r.amount_high) : shortMoney(r.amount_low)+' – '+shortMoney(r.amount_high);
const safeURL = u => /^https:\/\//.test(u || '') ? esc(u) : '#';
let data, districts, results=[], state=structuredClone(DEFAULT), page=0, layer='procurement', zoom=1, lastTrigger=null;
const PAGE_SIZE=20;

function init() {
  $('snapshot-date').textContent=displayDate(data.as_of_date);
  makeMulti('type',CATEGORIES,state.categories,'categories');
  makeMulti('stage',STAGES.filter(s=>data.records.some(r=>r.stage===s)),state.stages,'stages');
  const departments=[...new Set(data.records.map(r=>r.department))].sort();
  $('department').insertAdjacentHTML('beforeend',departments.map(d=>`<option value="${esc(d)}">${esc(d)}</option>`).join(''));
  $('geography').insertAdjacentHTML('beforeend',Array.from({length:10},(_,i)=>`<option value="district-${i+1}">Council District ${i+1} · Identified Facilities</option>`).join(''));
  $('source').insertAdjacentHTML('beforeend',data.sources.filter(s=>data.records.some(r=>r.source_id===s.id)).map(s=>`<option value="${esc(s.id)}">${esc(s.title)}</option>`).join(''));
  let timer;
  $('search').addEventListener('input',()=>{clearTimeout(timer);timer=setTimeout(()=>{state.search=$('search').value;change();},140);});
  for (const [id,key] of Object.entries({department:'departments',entity:'entity',amount:'amount',geography:'geography',source:'source',sort:'sort'})) $(id).addEventListener('change',()=>{state[key]=$(id).value;change();});
  document.querySelectorAll('[data-view]').forEach(b=>b.addEventListener('click',()=>{state.stages=b.dataset.view==='pipeline'?[...PIPELINE]:b.dataset.view==='portfolio'?[...PORTFOLIO]:[];change();}));
  document.querySelectorAll('[data-layer]').forEach(b=>b.addEventListener('click',()=>{layer=b.dataset.layer;$('map-popup').hidden=true;renderMap();}));
  ['reset','empty-reset'].forEach(id=>$(id).addEventListener('click',reset));
  ['show-coverage','coverage-jump','banner-coverage'].forEach(id=>$(id).addEventListener('click',()=>{$('coverage').scrollIntoView({behavior:'smooth'});}));
  $('export').addEventListener('click',()=>{const url=URL.createObjectURL(new Blob([exportCSV(results)],{type:'text/csv;charset=utf-8;'}));const a=document.createElement('a');a.href=url;a.download='Quant_Strata_Philadelphia_Procurement_'+data.as_of_date+'.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});
  $('prev-page').addEventListener('click',()=>{page=Math.max(0,page-1);renderTable();});
  $('next-page').addEventListener('click',()=>{page++;renderTable();});
  $('close-dialog').addEventListener('click',closeDialog);
  $('record-dialog').addEventListener('click',e=>{if(e.target===$('record-dialog')){const r=e.target.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeDialog();}});
  $('record-dialog').addEventListener('close',()=>lastTrigger?.focus());
  document.addEventListener('keydown',e=>{if(e.key==='Escape'){document.querySelectorAll('.multi-select').forEach(d=>d.open=false);$('map-popup').hidden=true;}});
  document.addEventListener('click',e=>document.querySelectorAll('.multi-select[open]').forEach(d=>{if(!d.contains(e.target))d.open=false;}));
  $('zoom-in').addEventListener('click',()=>{zoom=Math.min(3.2,zoom*1.35);mapExtent();});
  $('zoom-out').addEventListener('click',()=>{zoom=Math.max(1,zoom/1.35);mapExtent();});
  $('zoom-reset').addEventListener('click',()=>{zoom=1;mapExtent();});
  renderCoverage();change();$('export').disabled=false;
}

function makeMulti(prefix,options,selected,key) {
  const target=$(prefix+'-options');
  target.innerHTML=`<label class="all-option"><input type="checkbox" data-all="true" ${!selected.length?'checked':''}>All ${prefix==='type'?'Contract Types':'Stages'}</label>`+options.map(s=>`<label><input type="checkbox" value="${esc(s)}" ${selected.includes(s)?'checked':''}>${esc(s)}</label>`).join('');
  target.addEventListener('change',e=>{
    state[key]=e.target.dataset.all?[]:[...target.querySelectorAll('input:not([data-all]):checked')].map(i=>i.value);
    // Selecting a category from All switches to that category. No selection means All.
    change();
  });
}

function syncMulti(prefix,selected) {
  $(prefix+'-options').querySelectorAll('input').forEach(i=>{i.checked=i.dataset.all?!selected.length:selected.includes(i.value);});
  $(prefix+'-summary').textContent=!selected.length?'All '+(prefix==='type'?'Contract Types':'Stages'):selected.length===1?selected[0]:selected.length+' '+(prefix==='type'?'Types':'Stages')+' Selected';
}

function change() {page=0;$('map-popup').hidden=true;results=sortRecords(filterRecords(data.records,state),state.sort);render();}
function reset() {state=structuredClone(DEFAULT);for(const id of ['search','department','entity','amount','geography','source','sort'])$(id).value=state[id==='department'?'departments':id];zoom=1;change();}
function viewName(){const a=[...state.stages].sort().join('|');return a===[...PIPELINE].sort().join('|')?'Opportunity Pipeline':a===[...PORTFOLIO].sort().join('|')?'Contract Portfolio':!a?'All Records':'Filtered Procurement Records';}

function render() {
  syncMulti('type',state.categories);syncMulti('stage',state.stages);
  $('geography').value=state.geography;
  const name=viewName(),stats=summarize(results,data.as_of_date);
  $('view-title').textContent=name;
  $('result-description').textContent=`${number(stats.total)} Matching Records · ${number(stats.departments)} Departments / Agencies · Snapshot ${displayDate(data.as_of_date)}`;
  document.querySelectorAll('[data-view]').forEach(b=>{const active=name==={pipeline:'Opportunity Pipeline',portfolio:'Contract Portfolio',all:'All Records'}[b.dataset.view];b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});
  const tiles=name==='Contract Portfolio'?[['Contract Listings',stats.contract,'Executed + historical source rows'],['Notices of Intent',stats.intent,'Separate from executed awards'],['Professional Services',stats.professional,'Vendor / term and notice records'],['Published Values',stats.known,'Rows with a stated amount']]:[['Open Opportunities',stats.open,'Published open in the source snapshot'],['Forecast Opportunities',stats.forecast,'Anticipated solicitations · subject to change'],['Contract Listings',stats.contract,'Executed + historical source rows'],['Due Within 30 Days',stats.due30,'Open records · from snapshot date']];
  $('kpis').innerHTML=tiles.map(([label,value,note])=>`<article class="kpi"><span class="micro-label">${esc(label.toUpperCase())}</span><strong>${number(value)}</strong><small>${esc(note)}</small></article>`).join('');
  renderSignals(stats);renderBars();renderMap();renderTable();renderChips();
}

function renderSignals(stats) {
  const urgent=results.filter(r=>r.stage==='Open'&&daysUntil(r.due,data.as_of_date)!==null&&daysUntil(r.due,data.as_of_date)>=0&&daysUntil(r.due,data.as_of_date)<=14).sort((a,b)=>a.due.localeCompare(b.due));
  const next=results.filter(r=>r.stage==='Forecast'&&r.anticipated&&r.anticipated.slice(0,7)>=data.as_of_date.slice(0,7)).sort((a,b)=>a.anticipated.localeCompare(b.anticipated));
  const signals=[];
  if(urgent.length)signals.push({title:`${number(urgent.length)} Opportunities Due Within 14 Days`,text:`Nearest deadline: ${displayDate(urgent[0].due)}. ${urgent[0].title}`,record:urgent[0]});
  else if(stats.contract)signals.push({title:`${number(stats.contract)} Executed / Historical Listings`,text:'Review vendor and term details. Counts represent source rows; they are not a distinct-contract or spending measure.'});
  else signals.push({title:stats.open?'Review the Open Opportunity Pipeline':'Broaden the View',text:stats.open?'Open the original solicitation to confirm requirements and current deadlines.':'Include additional stages or contract types to compare more records.'});
  if(next.length)signals.push({title:`${number(next.length)} Forecast Records From This Month Onward`,text:`Earliest anticipated month: ${monthDate(next[0].anticipated)}. Forecast dates are estimates, not response deadlines.`,record:next[0]});
  else{const top=groupCounts(results,'department')[0];if(top)signals.push({title:`${top[0]} Leads This Selection`,text:`${number(top[1])} matching records. This is a listing count, not the department’s total procurement spending.`});}
  signals.push({title:`${number(stats.mapped)} Records Have an Identified Facility`,text:`${number(stats.total-stats.mapped)} matching records remain searchable without a mapped location. Explore capital projects as a separate context layer.`});
  $('signals').innerHTML=signals.slice(0,3).map(s=>`<div class="signal"><i class="signal-dot" aria-hidden="true"></i><div><strong>${esc(s.title)}</strong><p>${esc(s.text)}</p>${s.record?`<button class="text-button" data-record="${esc(s.record.id)}">Inspect Record →</button>`:''}</div></div>`).join('');
  bindRecords($('signals'));
}
function renderBars() {
  const groups=groupCounts(results,'category'),max=groups[0]?.[1]||1;
  $('type-chart').innerHTML=groups.length?groups.map(([label,count],i)=>`<div class="bar-row"><div class="bar-info"><span>${esc(label)}</span><strong>${number(count)}</strong></div><div class="bar-track"><div class="bar-fill" style="width:${100*count/max}%;background:${['#177da2','#3da5c3','#70b6cd','#9fcbd9','#c1d9e2'][i%5]}"></div></div></div>`).join(''):'<p class="chart-note">No Matching Records.</p>';
}
function renderChips() {
  const chips=[];
  for(const c of state.categories)chips.push({label:c,key:'categories',value:c});
  for(const [key,label] of [['search',state.search],['departments',state.departments],['amount',state.amount?$('amount').selectedOptions[0].textContent:''],['geography',state.geography?$('geography').selectedOptions[0].textContent:''],['source',state.source?$('source').selectedOptions[0].textContent:'']])if(label)chips.push({label,key});
  $('active-filters').innerHTML=chips.map((c,i)=>`<span class="filter-chip">${esc(c.label)}<button data-chip="${i}" aria-label="Remove ${esc(c.label)} Filter">×</button></span>`).join('');
  $('active-filters').querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>{const c=chips[+b.dataset.chip];if(c.key==='categories')state.categories=state.categories.filter(x=>x!==c.value);else{state[c.key]='';$(c.key==='departments'?'department':c.key).value='';}change();}));
}

function renderTable() {
  const rows=results.slice(page*PAGE_SIZE,(page+1)*PAGE_SIZE);
  $('records-body').innerHTML=rows.map(r=>{
    let timing=r.due?`<span class="cell-type">${displayDate(r.due)}</span><span class="cell-sub">Response Deadline</span>`:r.stage==='Forecast'?`<span class="cell-type">${monthDate(r.anticipated)}</span><span class="cell-sub">Anticipated Solicitation</span>`:r.end?`<span class="cell-type">${displayDate(r.end)}</span><span class="cell-sub">Recorded Term End</span>`:r.posted?`<span class="cell-type">${displayDate(r.posted)}</span><span class="cell-sub">Posted / Notice Date</span>`:'<span class="cell-sub">Not Published</span>';
    return `<tr><td><button class="record-title" data-record="${esc(r.id)}">${esc(r.title)}</button><span class="record-ref">${esc(r.reference)}${r.location?' · Identified Facility':''}</span>${r.vendor?`<span class="record-vendor">${esc(r.vendor)}</span>`:''}</td><td><span class="cell-type">${esc(r.category)}</span><span class="cell-sub">${esc(r.department)}</span></td><td><span class="stage-pill ${r.stage==='Open'?'open':r.stage==='Forecast'?'forecast':r.stage==='Executed Listing'?'executed':r.stage==='Intent to Contract'?'intent':r.stage==='Cancelled'?'cancelled':''}">${esc(r.stage)}</span>${r.snapshot?`<span class="cell-sub">${esc(r.snapshot)}</span>`:''}</td><td>${timing}</td><td><span class="cell-value">${esc(moneyLabel(r))}</span><span class="cell-sub">${esc(r.amount_basis)}</span></td><td><a class="source-arrow" href="${safeURL(r.source_url)}" target="_blank" rel="noopener noreferrer" aria-label="Open Official Source for ${esc(r.reference)}">→</a></td></tr>`;
  }).join('');
  $('empty-state').hidden=!!results.length;
  $('page-info').textContent=results.length?`${number(page*PAGE_SIZE+1)}–${number(Math.min((page+1)*PAGE_SIZE,results.length))} of ${number(results.length)} Records`:'0 Matching Records';
  $('prev-page').disabled=page===0;$('next-page').disabled=(page+1)*PAGE_SIZE>=results.length;
  bindRecords($('records-body'));
}
function bindRecords(el) {el.querySelectorAll('[data-record]').forEach(b=>b.addEventListener('click',()=>openRecord(b.dataset.record,b)));}
function openRecord(id,trigger) {
  const r=data.records.find(x=>x.id===id);if(!r)return;lastTrigger=trigger;
  const fields=[['REFERENCE',r.reference],['RECORD STAGE',r.stage],['DEPARTMENT / AGENCY',r.department],['CONTRACT TYPE',r.category],['ENTITY',r.entity],['VENDOR',r.vendor||'Not Published'],['POSTED / NOTICE DATE',displayDate(r.posted)],['RESPONSE DEADLINE',displayDate(r.due)],['ANTICIPATED SOLICITATION',r.anticipated?monthDate(r.anticipated):'Not Published'],['RECORDED TERM',`${displayDate(r.start)} → ${displayDate(r.end)}`],['PUBLISHED VALUE',r.amount_label],['VALUE BASIS',r.amount_basis],['SERVICE TYPE / METHOD',r.service_type||'Not Published'],['NIGP / NAICS CODES',r.codes.length?r.codes.join(' · '):'Not Published']];
  const note=r.stage==='Historical Snapshot'?'Historical reporting snapshot '+r.snapshot+'. The amount is not a current contract balance or current City spending.':r.stage==='Forecast'?'Forecast timing, scope, and cost are anticipated and subject to change. This record does not establish an open solicitation or awarded contract.':r.stage==='Intent to Contract'?'A notice of intent is distinct from an executed award. Verify execution and supplier details at the official source.':r.stage==='Executed Listing'?'This is an executed-contract vendor / term source row. Recorded dates alone do not confirm current contract status, performance, or remaining value.':'Confirm the current deadline, eligibility, documents, and any amendments in the original solicitation. This dashboard is a dated public-data snapshot.';
  $('detail-content').innerHTML=`<h2 id="detail-title">${esc(r.title)}</h2><p class="detail-description">${esc(r.description||'Description Not Published')}</p><div class="detail-grid">${fields.map(([k,v])=>`<div><span>${k}</span><strong>${esc(v)}</strong></div>`).join('')}</div>${r.subcontracting?`<p class="detail-description"><strong>Potential Subcontracting:</strong> ${esc(r.subcontracting)}</p>`:''}<p class="detail-note">${esc(note)}</p><p class="detail-description"><strong>Location:</strong> ${r.location?`${esc(r.location.label)} · ${esc(r.location.address)} · Council District ${esc(r.location.district)}<br>${esc(r.location.basis)}. Pin identifies the facility, not a verified work footprint.`:'No reliable project location has been linked. This record stays in the searchable explorer.'}</p><div class="detail-actions"><a class="button" href="${safeURL(r.source_url)}" target="_blank" rel="noopener noreferrer">Open Official Source →</a><span class="cell-sub">${esc(r.source)} · Retrieved ${displayDate(data.as_of_date)}</span></div>`;
  $('record-dialog').showModal();
}
function closeDialog(){$('record-dialog').close();}

// Geographic projection uses official GeoJSON in WGS84. No invented project coordinates.
function mercator([lon,lat]){return [lon*Math.PI/180,Math.log(Math.tan(Math.PI/4+lat*Math.PI/360))];}
function projectFactory(){const pts=[];for(const f of districts.features){const polys=f.geometry.type==='Polygon'?[f.geometry.coordinates]:f.geometry.coordinates;for(const p of polys)for(const ring of p)pts.push(...ring.map(mercator));}const xs=pts.map(p=>p[0]),ys=pts.map(p=>p[1]),minX=Math.min(...xs),maxX=Math.max(...xs),minY=Math.min(...ys),maxY=Math.max(...ys),scale=Math.min(590/(maxX-minX),460/(maxY-minY));return ll=>{const [x,y]=mercator(ll);return [350+(x-(minX+maxX)/2)*scale,250-(y-(minY+maxY)/2)*scale];};}
function pathFor(f,project){const polys=f.geometry.type==='Polygon'?[f.geometry.coordinates]:f.geometry.coordinates;return polys.map(poly=>poly.map(ring=>ring.map((p,i)=>{const [x,y]=project(p);return `${i?'L':'M'}${x.toFixed(2)},${y.toFixed(2)}`;}).join('')+'Z').join('')).join('');}
function ringCentroid(ring){let area=0,cx=0,cy=0;for(let i=0,j=ring.length-1;i<ring.length;j=i++){const [x,y]=ring[i],[x0,y0]=ring[j],a=x0*y-x*y0;area+=a;cx+=(x+x0)*a;cy+=(y+y0)*a;}return [cx/(3*area),cy/(3*area)];}
function renderMap(){
  const svg=$('map'),project=projectFactory();
  const shapes=districts.features.map(f=>{const n=String(f.properties.district),selected=state.geography==='district-'+n;return `<path class="district${selected?' selected':''}" d="${pathFor(f,project)}" fill-rule="evenodd" tabindex="0" role="button" aria-label="Filter Identified Facilities in Council District ${n}" data-district="${n}"><title>Council District ${n}</title></path>`;}).join('');
  const labels=districts.features.map(f=>{let coords=f.geometry.type==='Polygon'?f.geometry.coordinates[0]:f.geometry.coordinates[0][0];const c=project(ringCentroid(coords)),n=String(f.properties.district);return `<text class="district-label${state.geography==='district-'+n?' selected':''}" x="${c[0].toFixed(2)}" y="${c[1].toFixed(2)}" text-anchor="middle">${n}</text>`;}).join('');
  let items=[];
  if(layer==='procurement'){
    const groups=new Map();for(const r of results.filter(r=>r.location)){const l=r.location,key=l.label+':'+l.lon.toFixed(4)+':'+l.lat.toFixed(4);if(!groups.has(key))groups.set(key,{...l,records:[]});groups.get(key).records.push(r);}items=[...groups.values()];
  }else{
    const groups=new Map();for(const p of data.projects){if(state.geography.startsWith('district-')&&p.district!==state.geography.slice(9))continue;const key=p.site+':'+p.lon.toFixed(4)+':'+p.lat.toFixed(4);if(!groups.has(key))groups.set(key,{...p,records:[]});groups.get(key).records.push(p);}items=[...groups.values()];
  }
  const pins=items.map((p,i)=>{const [x,y]=project([p.lon,p.lat]),r=layer==='procurement'?7:3.6;return `<circle class="map-pin ${layer==='procurement'?'procurement':'capital'}" cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" r="${r}" tabindex="0" role="button" data-pin="${i}" aria-label="${esc(p.label||p.site)} · ${p.records.length} ${layer==='procurement'?'Procurement Records':'Capital Projects'}"><title>${esc(p.label||p.site)} · ${p.records.length} Records</title></circle>`;}).join('');
  svg.innerHTML=`<title id="map-svg-title">Philadelphia Council Districts and ${layer==='procurement'?'Procurement Facility Associations':'Capital Project Context'}</title><desc id="map-svg-desc">Select a district to filter records with an identified facility. Use the Geography dropdown as an accessible alternative.</desc><g>${shapes}${labels}${pins}</g>`;
  svg.querySelectorAll('[data-district]').forEach(el=>{const activate=()=>{state.geography=state.geography==='district-'+el.dataset.district?'':'district-'+el.dataset.district;change();};el.addEventListener('click',activate);el.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();activate();}});});
  svg.querySelectorAll('[data-pin]').forEach(el=>{const activate=()=>showMapPopup(items[+el.dataset.pin]);el.addEventListener('click',activate);el.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();activate();}});});
  $('map-count').textContent=`${items.length} ${layer==='procurement'?'Facilities':'Context Sites'}`;
  $('map-note').textContent=layer==='procurement'?'Named facilities are linked conservatively from record text. Pins identify a facility, not a verified work footprint. Unlocated records remain searchable.':'Capital projects are a separate context layer, not open-contract opportunities. Contract-type and stage filters apply to the procurement table, not this context layer.';
  document.querySelectorAll('[data-layer]').forEach(b=>{b.classList.toggle('active',b.dataset.layer===layer);b.setAttribute('aria-pressed',String(b.dataset.layer===layer));});mapExtent();
}
function mapExtent(){const w=700/zoom,h=500/zoom;$('map').setAttribute('viewBox',`${350-w/2} ${250-h/2} ${w} ${h}`);}
function showMapPopup(item){const popup=$('map-popup');popup.innerHTML=`<button class="close-button" aria-label="Close Map Popup">×</button><strong>${esc(item.label||item.site)}</strong><p>${esc(item.address)} · District ${esc(item.district)}<br>${layer==='procurement'?'Named Facility Association':'Capital Project Context · Not an Open-Bid Indicator'}</p>${item.records.slice(0,3).map(r=>layer==='procurement'?`<button class="text-button" data-record="${esc(r.id)}">${esc(r.title)} →</button>`:`<p><strong>${esc(r.title)}</strong>${esc(r.status||'Status Not Published')}</p>`).join('')}<p>${item.records.length} ${layer==='procurement'?'Matching Procurement Records':'Capital Project Records'} at This Location</p>`;popup.hidden=false;popup.querySelector('.close-button').addEventListener('click',()=>popup.hidden=true);bindRecords(popup);}

function renderCoverage(){
  $('source-body').innerHTML=data.sources.map(s=>`<tr><td><a href="${safeURL(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.title)} →</a></td><td>${number(s.count)}<small>${esc(s.unit)}</small></td><td><strong>${esc(s.period)}</strong><small>${esc(s.note)}</small></td></tr>`).join('');
  $('coverage-gaps').innerHTML=data.gaps.map(s=>`<li>${esc(s)}</li>`).join('');
}

try {
  const responses=await Promise.all([fetch('./data/records.json.gz'),fetch('./data/districts.geojson')]);
  if(responses.some(r=>!r.ok))throw new Error('The Public Snapshot Could Not Be Loaded.');
  [data,districts]=await Promise.all([new Response(responses[0].body.pipeThrough(new DecompressionStream('gzip'))).json(),responses[1].json()]);
  if(!data.records?.length||districts.features?.length!==10)throw new Error('Snapshot Validation Failed.');
  init();
}catch(error){$('load-error').textContent='The public-data snapshot could not be loaded. Refresh the page or use the sources and methodology link.';$('load-error').hidden=false;$('snapshot-date').textContent='Snapshot Unavailable';$('result-description').textContent='Filters will be available when the public snapshot loads.';console.error(error);}
