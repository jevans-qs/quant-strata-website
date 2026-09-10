const BUS=["Industrial Systems","Field Services","Digital & Advisory"], REGS=["Northeast","Mid-Atlantic","Southeast","Midwest"];

const D={
 enterprise:{revA:164.1,revB:167.8,ebA:16.7,ebB:20.7,gmA:.32,gmB:.34},
 bu:{
  "Industrial Systems":{revA:78.1,revB:80.2,ebA:8.4,ebB:10.8,gmA:.293,gmB:.320},
  "Field Services":{revA:52.1,revB:54.9,ebA:3.9,ebB:6.8,gmA:.300,gmB:.340},
  "Digital & Advisory":{revA:33.9,revB:32.7,ebA:4.4,ebB:3.1,gmA:.413,gmB:.38945}
 },
 region:{
  "Northeast":{revA:47.9,revB:52.5,ebA:3.6,ebB:6.2},
  "Mid-Atlantic":{revA:46.3,revB:46.0,ebA:5.6,ebB:5.8},
  "Southeast":{revA:37.4,revB:36.2,ebA:4.0,ebB:4.1},
  "Midwest":{revA:32.5,revB:33.1,ebA:3.5,ebB:4.6}
 },
 matrices:{
  revA:[[24.803,22.912,15.948,14.436],[14.846,13.538,12.374,11.341],[8.251,9.849,9.077,6.723]],
  revB:[[27.183,22.822,15.483,14.711],[16.751,13.883,12.368,11.898],[8.566,9.294,8.349,6.490]],
  ebA:[[1.937,2.908,1.906,1.648],[.626,1.266,1.065,.942],[1.036,1.426,1.028,.909]],
  ebB:[[3.552,3.088,1.973,2.187],[1.612,1.887,1.547,1.754],[1.036,.826,.580,.658]]
 },
 monthly:{revA:[20.42,19.43,20.88,20.09,21.14,20.55,21.40,20.19],revB:[20.88,19.86,21.35,20.54,21.62,21.01,21.88,20.64]},
 waterfall:[
  {l:"Budget",v:20.7,t:"start"},{l:"Revenue / Volume",v:-1.1,t:"neg"},{l:"Price",v:.4,t:"pos"},{l:"Mix",v:-.6,t:"neg"},
  {l:"Labor",v:-1.5,t:"neg"},{l:"Subcontractors",v:-.8,t:"neg"},{l:"Other",v:-.4,t:"neg"},{l:"Actual",v:16.7,t:"end"}
 ]
};

const CASH={
 bridge:[{l:"Expected",v:22.4,t:"start"},{l:"EBITDA",v:-4.0,t:"neg"},{l:"AR / Collections",v:-5.5,t:"neg"},{l:"Inventory",v:-.8,t:"neg"},{l:"AP Timing",v:1.3,t:"pos"},{l:"CapEx Timing",v:1.2,t:"pos"},{l:"Actual",v:14.6,t:"end"}],
 aging:[{l:"Current",v:14.8},{l:"1–30",v:8.9},{l:"31–60",v:6.5},{l:"61–90",v:4.1},{l:"90+",v:2.9}],
 forecast:{base:[14.6,14.2,13.9,13.6,13.8,13.3,13.0,12.8,12.9,12.6,12.7,12.9,13.0,13.2],action:[14.6,14.4,14.2,14.1,14.5,14.4,14.6,14.8,15.2,15.6,16.0,16.3,16.6,17.0]},
 accounts:[["Summit Infrastructure","$1.8M","74 days","61–90"],["Meridian Health Systems","$1.4M","67 days","61–90"],["Northstar Manufacturing","$1.2M","92 days","90+"],["Apex Utility Services","$1.0M","63 days","61–90"],["Keystone Transit Group","$0.9M","58 days","31–60"],["Beacon Public Works","$0.8M","85 days","61–90"]]
};

const SCENARIOS={
 "Upside":{
  pricing:1.8,volume:1.0,labor:2.5,util:79,dso:43,digital:16.5,rev:252.8,ebitda:29.8,cash:20.4,
  narrative:"Pricing realization, better Field Services utilization, disciplined labor economics and normalized collections produce the strongest recovery path."
 },
 "Base Case":{
  pricing:1.0,volume:-0.8,labor:3.5,util:75,dso:47,digital:12,rev:246.5,ebitda:24.6,cash:13.1,
  narrative:"Partial Northeast recovery and moderate collections improvement stabilize the business, but profitability remains below plan and liquidity stays constrained."
 },
 "Downside":{
  pricing:.4,volume:-3.0,labor:5.0,util:70,dso:55,digital:7,rev:239.4,ebitda:18.9,cash:7.2,
  narrative:"Persistent volume pressure, higher labor costs, weak utilization and worsening collections create a material earnings and liquidity risk."
 }
};
const BUDGET={rev:252.0,ebitda:31.0,cash:24.5,dso:43,margin:31/252};
let selectedScenario="Base Case";

const fmtM=v=>`${v<0?'-':''}$${Math.abs(v).toFixed(1)}M`;
const pct=v=>`${v>=0?'+':''}${(v*100).toFixed(1)}%`;
const pt=v=>`${v>=0?'+':''}${(v*100).toFixed(1)} pts`;

function getScope(){
 const bu=document.getElementById('buFilter').value, rg=document.getElementById('regionFilter').value;
 if(bu==='Enterprise'&&rg==='All Regions') return {...D.enterprise,bu,rg};
 if(bu!=='Enterprise'&&rg==='All Regions') return {...D.bu[bu],bu,rg};
 if(bu==='Enterprise'&&rg!=='All Regions'){
   const x=D.region[rg], gm=.32+({"Northeast":-.012,"Mid-Atlantic":.004,"Southeast":.003,"Midwest":0}[rg]);
   const gmb=.34+({"Northeast":-.006,"Mid-Atlantic":.003,"Southeast":.002,"Midwest":0}[rg]);
   return {...x,gmA:gm,gmB:gmb,bu,rg};
 }
 const i=BUS.indexOf(bu),j=REGS.indexOf(rg),revA=D.matrices.revA[i][j],revB=D.matrices.revB[i][j],ebA=D.matrices.ebA[i][j],ebB=D.matrices.ebB[i][j];
 const base=D.bu[bu], adj={"Northeast":-.012,"Mid-Atlantic":.004,"Southeast":.003,"Midwest":0}[rg];
 return {revA,revB,ebA,ebB,gmA:Math.max(.18,base.gmA+adj),gmB:Math.max(.18,base.gmB+adj/2),bu,rg};
}

function pill(el,value,type='pct'){
 if(!el)return;
 const n=value; el.className='pill '+(n<-.002?'bad':n>.002?'good':'neutral');
 el.textContent=type==='pt'?pt(n):pct(n);
}
function moneyPill(el,value){
 if(!el)return;
 el.className='pill '+(Math.abs(value)<.05?'neutral':value>=0?'good':'bad');
 el.textContent=fmtM(value);
}

function updateKPIs(){
 const x=getScope(), revVar=x.revA/x.revB-1, ebVar=x.ebA/x.ebB-1, emA=x.ebA/x.revA, emB=x.ebB/x.revB;
 document.getElementById('revVal').textContent=fmtM(x.revA); document.getElementById('gmVal').textContent=(x.gmA*100).toFixed(1)+'%'; document.getElementById('ebitdaVal').textContent=fmtM(x.ebA); document.getElementById('emVal').textContent=(emA*100).toFixed(1)+'%';
 pill(document.getElementById('revPill'),revVar); pill(document.getElementById('gmPill'),x.gmA-x.gmB,'pt'); pill(document.getElementById('ebitdaPill'),ebVar); pill(document.getElementById('emPill'),emA-emB,'pt');
 const scope=`${x.bu} · ${x.rg} · YTD through August 2026`; document.getElementById('scopeLabel').textContent=scope; document.getElementById('scopeLabel2').textContent=scope;
 document.getElementById('actionRev').textContent=fmtM(x.revA-x.revB); document.getElementById('actionEb').textContent=fmtM(x.ebA-x.ebB);
 renderPnl(x); renderInsights(x); renderDiagnostics(x); renderDrivers(x);
}

function svgLineChart(target,actual,budget){
 const w=760,h=250,p={l:42,r:16,t:15,b:32},all=[...actual,...budget],min=Math.min(...all)-.8,max=Math.max(...all)+.8,x=i=>p.l+i*(w-p.l-p.r)/(actual.length-1),y=v=>p.t+(max-v)*(h-p.t-p.b)/(max-min);
 let g='';for(let k=0;k<5;k++){const yy=p.t+k*(h-p.t-p.b)/4,val=max-k*(max-min)/4;g+=`<line class="gridline" x1="${p.l}" x2="${w-p.r}" y1="${yy}" y2="${yy}"/><text class="axis-text" x="${p.l-8}" y="${yy+3}" text-anchor="end">$${val.toFixed(1)}</text>`}
 const poly=a=>a.map((v,i)=>`${x(i)},${y(v)}`).join(' '),area=`${x(0)},${h-p.b} ${poly(actual)} ${x(actual.length-1)},${h-p.b}`,months=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug'];
 let tx='';months.forEach((m,i)=>tx+=`<text class="axis-text" x="${x(i)}" y="${h-7}" text-anchor="middle">${m}</text>`);let dots='';actual.forEach((v,i)=>dots+=`<circle class="dot" cx="${x(i)}" cy="${y(v)}" r="4"/>`);
 target.innerHTML=`<svg class="chart-svg" viewBox="0 0 ${w} ${h}" aria-label="Monthly revenue actual versus budget chart"><defs><linearGradient id="areaFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stop-color="#5b9bd5" stop-opacity=".26"/><stop offset="100%" stop-color="#5b9bd5" stop-opacity=".02"/></linearGradient></defs>${g}<polygon class="area" points="${area}"/><polyline class="budget-line" points="${poly(budget)}"/><polyline class="actual-line" points="${poly(actual)}"/>${dots}${tx}</svg>`;
}
function renderWaterfall(){const t=document.getElementById('waterfall'),max=21;t.innerHTML=D.waterfall.map(d=>`<div class="wf-item"><span class="wf-val ${d.v<0?'neg':d.v>0&&d.t==='pos'?'pos':''}">${fmtM(d.v)}</span><div class="wf-bar ${d.t}" style="height:${Math.max(8,Math.abs(d.v)/max*180)}px"></div><span class="wf-label">${d.l}</span></div>`).join('')}
function renderBUTable(){document.getElementById('buTable').innerHTML=BUS.map(b=>{const x=D.bu[b],rv=x.revA/x.revB-1,ev=x.ebA/x.ebB-1;return `<tr><td><strong>${b}</strong></td><td>${fmtM(x.revA)}</td><td class="${rv<0?'neg':'pos'}">${pct(rv)}</td><td>${fmtM(x.ebA)}</td><td class="${ev<0?'neg':'pos'}">${pct(ev)}</td></tr>`}).join('')}
function renderInsights(x){
 const arr=x.bu==='Digital & Advisory'?[['green','Growth above plan','Demand and EBITDA are outperforming plan, creating a capacity-allocation decision.','+$1.3M EBITDA vs plan','good'],['amber','Capacity constraint','Current demand suggests incremental resources may create higher enterprise returns.','Resource decision',''],['amber','Forecast dependency','Sustaining outperformance requires delivery capacity to scale without eroding margin.','Monitor','']]:x.bu==='Field Services'||x.rg==='Northeast'?[['red','Service margin pressure','Utilization, overtime and subcontractor dependence are eroding profitability.','High','bad'],['red','Northeast concentration','A disproportionate share of the enterprise EBITDA gap is concentrated in the Northeast.','Critical','bad'],['amber','Execution recovery','Operating intervention can improve earnings without relying on topline recovery.','90–120 days','']]:[['red','Margin compression','The revenue miss is modest, but earnings are deteriorating much faster than topline performance.','-$4.0M EBITDA','bad'],['red','Working capital deterioration','DSO has increased to 53 days, creating a material cash-conversion problem.','-$7.8M cash gap','bad'],['green','Digital & Advisory upside','The highest-margin business is exceeding plan and may warrant incremental resources.','+$1.2M revenue','good']];
 document.getElementById('insights').innerHTML=arr.map(a=>`<div class="insight"><span class="severity ${a[0]}"></span><div><strong>${a[1]}</strong><p>${a[2]}</p></div><span class="impact ${a[4]}">${a[3]}</span></div>`).join('');
}
function renderPnl(x){const gpA=x.revA*x.gmA,gpB=x.revB*x.gmB,opA=gpA-x.ebA,opB=gpB-x.ebB,rows=[['Revenue',x.revA,x.revB],['Gross Profit',gpA,gpB],['Operating Expense',opA,opB],['EBITDA',x.ebA,x.ebB]];document.getElementById('pnlTable').innerHTML=rows.map(r=>{const v=r[1]-r[2],p=v/Math.abs(r[2]);return `<tr><td><strong>${r[0]}</strong></td><td>${fmtM(r[1])}</td><td>${fmtM(r[2])}</td><td class="${v<0?'neg':'pos'}">${fmtM(v)}</td><td class="${p<0?'neg':'pos'}">${pct(p)}</td></tr>`}).join('')}
function renderDiagnostics(x){let arr;if(x.bu==='Digital & Advisory')arr=[['green','Mix is favorable','Higher-margin advisory demand is supporting enterprise earnings despite weakness elsewhere.'],['amber','Capacity should be tested','Bookings and backlog justify testing whether incremental staffing can be deployed at target margin.'],['amber','Do not over-generalize','Strong performance in this unit should not mask enterprise cash and service-delivery issues.']];else if(x.bu==='Field Services'||x.rg==='Northeast')arr=[['red','Labor economics require intervention','Lower utilization combined with overtime and subcontracting is producing a structural EBITDA issue.'],['red','Revenue recovery alone is insufficient','Even if volume recovers, the current delivery model will continue to suppress margin.'],['amber','Prioritize controllable drivers','Utilization, scheduling and subcontractor mix provide nearer-term levers than waiting for demand.']];else arr=[['red','Earnings are falling faster than revenue','This points to a margin and cost problem—not simply a sales shortfall.'],['red','Cash is signaling a second problem','Higher DSO means liquidity is deteriorating independently of the P&L.'],['green','Resource allocation matters','Digital & Advisory is outperforming and provides a potential source of profitable growth.']];document.getElementById('diagnosticList').innerHTML=arr.map(a=>`<div class="insight"><span class="severity ${a[0]}"></span><div><strong>${a[1]}</strong><p>${a[2]}</p></div></div>`).join('')}
function renderMatrix(){let html='<div class="hdr">Business Unit</div>'+REGS.map(r=>`<div class="hdr">${r}</div>`).join('');BUS.forEach((b,i)=>{html+=`<div class="name">${b}</div>`;REGS.forEach((r,j)=>{const rv=D.matrices.revA[i][j]/D.matrices.revB[i][j]-1,em=D.matrices.ebA[i][j]/D.matrices.revA[i][j],cls=rv<-.06?'heat-bad':rv<-.015?'heat-warn':'heat-good';html+=`<div class="${cls}">${pct(rv)} rev<br>${(em*100).toFixed(1)}% EBITDA</div>`})});document.getElementById('performanceMatrix').innerHTML=html}
function renderDrivers(x){let drivers;if(x.bu==='Field Services'||x.rg==='Northeast')drivers=[['Technician Utilization',x.rg==='Northeast'?70.5:75,78],['Overtime Control',x.rg==='Northeast'?86:90,93],['Subcontractor Mix',x.rg==='Northeast'?62:70,82],['Bookings vs Plan',x.rg==='Northeast'?88:94,100]];else if(x.bu==='Digital & Advisory')drivers=[['Delivery Utilization',86,82],['Bookings vs Plan',112,100],['Backlog vs Plan',118,100],['Headcount Capacity',103,100]];else drivers=[['Service Utilization',75,78],['Pricing Realization',98,100],['Bookings vs Plan',97,100],['Collections / DSO',81,100]];document.getElementById('driverBars').innerHTML=drivers.map(d=>{const ratio=Math.min(1.2,d[1]/d[2]),good=d[1]>=d[2];return `<div class="driver-row"><span>${d[0]}</span><div class="bar-bg"><div class="bar-fill" style="width:${Math.min(100,ratio*80)}%;background:${good?'#2e9465':'#c76161'}"></div></div><strong class="${good?'pos':'neg'}">${d[1].toFixed(1)}</strong></div>`}).join('')}

function renderCashBridge(){const t=document.getElementById('cashBridge'),max=23;t.innerHTML=CASH.bridge.map(d=>`<div class="cb-item"><span class="cb-val ${d.v<0?'neg':d.v>0&&d.t==='pos'?'pos':''}">${fmtM(d.v)}</span><div class="cb-bar ${d.t}" style="height:${Math.max(8,Math.abs(d.v)/max*190)}px"></div><span class="cb-label">${d.l}</span></div>`).join('')}
function renderAging(){const t=document.getElementById('agingChart'),max=Math.max(...CASH.aging.map(d=>d.v)),tot=CASH.aging.reduce((a,b)=>a+b.v,0);t.innerHTML=CASH.aging.map(d=>`<div class="age-col"><span class="age-val">${fmtM(d.v)}</span><div class="age-bar" style="height:${d.v/max*160}px"></div><span class="age-label">${d.l}<span class="age-share">${Math.round(d.v/tot*100)}%</span></span></div>`).join('')}
function renderCashForecast(){const target=document.getElementById('cashForecastChart'),base=CASH.forecast.base,action=CASH.forecast.action,w=760,h=260,p={l:42,r:16,t:16,b:34},min=11.5,max=17.5,x=i=>p.l+i*(w-p.l-p.r)/(base.length-1),y=v=>p.t+(max-v)*(h-p.t-p.b)/(max-min),poly=a=>a.map((v,i)=>`${x(i)},${y(v)}`).join(' ');let g='';for(let k=0;k<5;k++){const yy=p.t+k*(h-p.t-p.b)/4,val=max-k*(max-min)/4;g+=`<line class="gridline" x1="${p.l}" x2="${w-p.r}" y1="${yy}" y2="${yy}"/><text class="axis-text" x="${p.l-8}" y="${yy+3}" text-anchor="end">$${val.toFixed(1)}</text>`}let tx='';[0,2,4,6,8,10,12,13].forEach(i=>tx+=`<text class="axis-text" x="${x(i)}" y="${h-8}" text-anchor="middle">W${i}</text>`);let dots='';action.forEach((v,i)=>dots+=`<circle class="action-dot" cx="${x(i)}" cy="${y(v)}" r="3.4"/>`);const floorY=y(12);target.innerHTML=`<svg class="chart-svg" viewBox="0 0 ${w} ${h}" aria-label="13 week cash forecast">${g}<line class="cash-floor" x1="${p.l}" x2="${w-p.r}" y1="${floorY}" y2="${floorY}"/><text class="axis-text" x="${w-p.r-4}" y="${floorY-5}" text-anchor="end" fill="#b33a3a">$12M liquidity floor</text><polyline class="budget-line" style="stroke:#0b5f95;stroke-dasharray:none;stroke-width:3" points="${poly(base)}"/><polyline class="action-line" points="${poly(action)}"/>${dots}${tx}</svg>`}
function renderCollections(){document.getElementById('collectionList').innerHTML=CASH.accounts.map(a=>`<div class="collection-row"><strong>${a[0]}</strong><span>${a[1]}</span><span class="late">${a[2]}</span><span>${a[3]}</span></div>`).join('')}

function readScenarioInputs(){return{
 pricing:+document.getElementById('pricingInput').value,
 volume:+document.getElementById('volumeInput').value,
 labor:+document.getElementById('laborInput').value,
 util:+document.getElementById('utilInput').value,
 dso:+document.getElementById('dsoInput').value,
 digital:+document.getElementById('digitalInput').value
}}
function applyPreset(name){
 selectedScenario=name;const s=SCENARIOS[name];
 document.getElementById('pricingInput').value=s.pricing;document.getElementById('volumeInput').value=s.volume;document.getElementById('laborInput').value=s.labor;document.getElementById('utilInput').value=s.util;document.getElementById('dsoInput').value=s.dso;document.getElementById('digitalInput').value=s.digital;
 document.querySelectorAll('.scenario-btn').forEach(b=>b.classList.toggle('active',b.dataset.scenario===name));
 renderScenario();
}
function calculateScenario(){
 const anchor=SCENARIOS[selectedScenario],x=readScenarioInputs();
 const dp=x.pricing-anchor.pricing,dv=x.volume-anchor.volume,dl=x.labor-anchor.labor,du=x.util-anchor.util,dd=x.dso-anchor.dso,ddig=x.digital-anchor.digital;
 const revDelta=1.45*dp+1.35*dv+.42*ddig;
 const ebDelta=.62*revDelta-.55*dl+.62*du;
 const cashDelta=.65*ebDelta+.25*revDelta-.58*dd;
 const rev=anchor.rev+revDelta,ebitda=anchor.ebitda+ebDelta,cash=anchor.cash+cashDelta,margin=ebitda/rev;
 return{...x,rev,ebitda,cash,margin,revDelta,ebDelta,cashDelta,anchor,contrib:{pricing:.62*(1.45*dp),volume:.62*(1.35*dv),labor:-.55*dl,util:.62*du,digital:.62*(.42*ddig),dso:-.58*dd}};
}
function updateScenarioOutputsLabel(x){
 document.getElementById('pricingOut').textContent=x.pricing.toFixed(1)+'%';document.getElementById('volumeOut').textContent=(x.volume>=0?'+':'')+x.volume.toFixed(1)+'%';document.getElementById('laborOut').textContent=x.labor.toFixed(1)+'%';document.getElementById('utilOut').textContent=x.util.toFixed(1)+'%';document.getElementById('dsoOut').textContent=x.dso.toFixed(0)+' days';document.getElementById('digitalOut').textContent=x.digital.toFixed(1)+'%';
 const changed=Math.abs(x.revDelta)+Math.abs(x.ebDelta)+Math.abs(x.cashDelta)>.01;
 document.getElementById('scenarioState').textContent=changed?`${selectedScenario} · Custom`:`${selectedScenario}`;
 document.getElementById('driverImpactTag').textContent=changed?'Custom vs '+selectedScenario:selectedScenario;
 document.getElementById('fcRevenue').textContent=fmtM(x.rev);document.getElementById('fcEbitda').textContent=fmtM(x.ebitda);document.getElementById('fcMargin').textContent=(x.margin*100).toFixed(1)+'%';document.getElementById('fcCash').textContent=fmtM(x.cash);document.getElementById('fcDso').textContent=x.dso.toFixed(0)+' days';
 moneyPill(document.getElementById('fcRevenuePill'),x.rev-BUDGET.rev);moneyPill(document.getElementById('fcEbitdaPill'),x.ebitda-BUDGET.ebitda);pill(document.getElementById('fcMarginPill'),x.margin-BUDGET.margin,'pt');moneyPill(document.getElementById('fcCashPill'),x.cash-BUDGET.cash);
 const dsoGap=x.dso-BUDGET.dso,el=document.getElementById('fcDsoPill');el.className='pill '+(dsoGap<=0?'good':'bad');el.textContent=(dsoGap>=0?'+':'')+dsoGap.toFixed(0)+' days';
 document.getElementById('decisionRevenue').textContent=fmtM(x.rev-BUDGET.rev);document.getElementById('decisionEbitda').textContent=fmtM(x.ebitda-BUDGET.ebitda);document.getElementById('decisionCash').textContent=fmtM(x.cash);
}
function scenarioStatus(value,good,warning,direction='high'){
 if(direction==='high')return value>=good?['On Track','good']:value>=warning?['Watch','warn']:['At Risk','bad'];
 return value<=good?['On Track','good']:value<=warning?['Watch','warn']:['At Risk','bad'];
}
function renderThresholds(x){
 const rows=[
  ['EBITDA Margin',(x.margin*100).toFixed(1)+'%','≥ 11.0%',...scenarioStatus(x.margin,.11,.095,'high')],
  ['Ending Cash',fmtM(x.cash),'≥ $12.0M',...scenarioStatus(x.cash,15,12,'high')],
  ['DSO',x.dso.toFixed(0)+' days','≤ 45 days',...scenarioStatus(x.dso,45,50,'low')],
  ['Revenue vs Budget',pct(x.rev/BUDGET.rev-1),'≥ -2.0%',...scenarioStatus(x.rev/BUDGET.rev-1,-.02,-.05,'high')]
 ];
 document.getElementById('thresholdList').innerHTML=rows.map(r=>`<div class="threshold"><div class="threshold-top"><span>${r[0]}</span><span class="threshold-status ${r[4]}">${r[3]}</span></div><strong>${r[1]}</strong><small>Guardrail ${r[2]}</small></div>`).join('');
}
function renderScenarioImpact(x){
 const impacts=[['Pricing',x.contrib.pricing,'EBITDA'],['Volume',x.contrib.volume,'EBITDA'],['Labor Inflation',x.contrib.labor,'EBITDA'],['Field Utilization',x.contrib.util,'EBITDA'],['Digital Growth',x.contrib.digital,'EBITDA'],['DSO',x.contrib.dso,'Cash']],max=Math.max(1.5,...impacts.map(d=>Math.abs(d[1])));
 document.getElementById('scenarioDriverImpact').innerHTML=impacts.map(d=>{const width=Math.min(50,Math.abs(d[1])/max*48),cls=d[1]>=0?'pos':'neg',style=d[1]>=0?`left:50%;width:${width}%`:`right:50%;width:${width}%`;return `<div class="impact-row"><span>${d[0]} <small>${d[2]}</small></span><div class="impact-track"><div class="impact-fill ${cls}" style="${style}"></div></div><strong class="${cls}">${fmtM(d[1])}</strong></div>`}).join('');
}
function scenarioNarrativeData(x){
 const points=[];let risk=0,opportunity=0;
 if(x.cash<12){risk+=2;points.push(['red','Liquidity floor breached',`Ending cash falls to ${fmtM(x.cash)}, below the $12.0M management floor. Immediate cash protection actions become necessary.`])}else if(x.cash<15){risk++;points.push(['amber','Liquidity remains constrained',`Ending cash of ${fmtM(x.cash)} provides limited cushion even though the formal liquidity floor is preserved.`])}else{opportunity++;points.push(['green','Liquidity cushion improves',`Ending cash reaches ${fmtM(x.cash)}, providing more operating flexibility.`])}
 if(x.margin<.095){risk+=2;points.push(['red','Profitability remains structurally weak',`EBITDA margin of ${(x.margin*100).toFixed(1)}% indicates that operating recovery is insufficient.`])}else if(x.margin<.11){risk++;points.push(['amber','Margin recovery is incomplete',`EBITDA margin improves to ${(x.margin*100).toFixed(1)}% but remains below the 11% management guardrail.`])}else{opportunity++;points.push(['green','Operating leverage is returning',`EBITDA margin of ${(x.margin*100).toFixed(1)}% indicates meaningful recovery in unit economics.`])}
 if(x.dso>50){risk++;points.push(['red','Collections remain a major constraint',`${x.dso.toFixed(0)} DSO keeps cash tied up in receivables and compounds the earnings problem.`])}else if(x.dso>45){points.push(['amber','Collections improve but remain above target',`${x.dso.toFixed(0)} DSO is better than the current 53-day position, but still above the 45-day management goal.`])}else{opportunity++;points.push(['green','Working-capital conversion normalizes',`${x.dso.toFixed(0)} DSO restores collections to the target range and releases liquidity.`])}
 if(x.util<73){risk++;points.push(['red','Field Services execution is still weak',`${x.util.toFixed(1)}% utilization does not absorb the delivery cost base efficiently.`])}else if(x.util>=78){opportunity++;points.push(['green','Field Services productivity recovers',`${x.util.toFixed(1)}% utilization materially improves labor economics and EBITDA conversion.`])}
 let leadTitle,leadText;if(risk>=3){leadTitle='Management intervention required';leadText='The modeled outcome combines earnings and liquidity pressure. The organization should prioritize controllable operating and cash-conversion levers before relying on revenue recovery.'}else if(opportunity>=3){leadTitle='Recovery case becomes credible';leadText='The modeled outcome improves both operating performance and liquidity. Management can begin shifting from defensive cash protection toward disciplined growth and resource allocation.'}else{leadTitle='Stabilization, but not full recovery';leadText='The modeled outcome preserves near-term flexibility, but at least one key guardrail remains below target. Management should continue targeted intervention and reforecast frequently.'}
 return{leadTitle,leadText,points:points.slice(0,4)};
}
function renderScenarioNarrative(x){
 const n=scenarioNarrativeData(x);document.getElementById('scenarioNarrative').innerHTML=`<div class="narrative-lead"><strong>${n.leadTitle}</strong><p>${n.leadText}</p></div>`+n.points.map(p=>`<div class="narrative-point"><span class="severity ${p[0]}"></span><div><strong>${p[1]}</strong><p>${p[2]}</p></div></div>`).join('');
 let decision;if(x.cash<12)decision='The current assumptions breach the liquidity floor. Management should treat collections, cost containment and discretionary cash uses as immediate interventions—not optional upside.';else if(x.margin<.11&&x.dso>45)decision='The scenario preserves liquidity but does not restore target profitability or working-capital discipline. A durable recovery requires both operating improvement and better collections.';else if(x.margin>=.11&&x.dso<=45)decision='The modeled assumptions restore the core management guardrails. Leadership can shift attention toward executing the recovery plan and selectively funding the highest-return growth opportunities.';else decision='The outlook is improving, but one major constraint remains unresolved. Management should target the limiting driver and rerun the forecast before committing incremental resources.';document.getElementById('forecastDecisionText').textContent=decision;
}
function renderScenarioTable(x){
 const rows=Object.entries(SCENARIOS).map(([name,s])=>({name,rev:s.rev,ebitda:s.ebitda,margin:s.ebitda/s.rev,cash:s.cash,dso:s.dso,narrative:s.narrative,type:'preset'}));rows.push({name:'Current Interactive',rev:x.rev,ebitda:x.ebitda,margin:x.margin,cash:x.cash,dso:x.dso,narrative:'Live output from the management assumptions currently selected above.',type:'custom'});
 document.getElementById('scenarioTable').innerHTML=rows.map(r=>`<tr class="${r.type==='custom'?'custom-row':r.name===selectedScenario?'selected-row':''}"><td><strong>${r.name}</strong></td><td>${fmtM(r.rev)}</td><td>${fmtM(r.ebitda)}</td><td>${(r.margin*100).toFixed(1)}%</td><td>${fmtM(r.cash)}</td><td>${r.dso.toFixed(0)} days</td><td>${r.narrative}</td></tr>`).join('');
}
function renderScenarioOutcomeChart(x){
 const target=document.getElementById('scenarioOutcomeChart'),cases=[['Upside',SCENARIOS['Upside']],['Base',SCENARIOS['Base Case']],['Downside',SCENARIOS['Downside']],['Current',{rev:x.rev,ebitda:x.ebitda,cash:x.cash}]],w=800,h=285,p={l:48,r:18,t:18,b:38},max=115,min=20,y=v=>p.t+(max-v)*(h-p.t-p.b)/(max-min),groupW=(w-p.l-p.r)/cases.length,barW=24;
 let grid='';[25,50,75,100].forEach(v=>{const yy=y(v);grid+=`<line class="gridline" x1="${p.l}" x2="${w-p.r}" y1="${yy}" y2="${yy}"/><text class="axis-text" x="${p.l-7}" y="${yy+3}" text-anchor="end">${v}%</text>`});
 const colors=['#153f62','#4d88b7','#3f9a70'];let bars='',labels='';cases.forEach((c,i)=>{const vals=[c[1].rev/BUDGET.rev*100,c[1].ebitda/BUDGET.ebitda*100,c[1].cash/BUDGET.cash*100],cx=p.l+groupW*i+groupW/2;vals.forEach((v,j)=>{const bx=cx+(j-1)*(barW+7)-barW/2,by=y(v),bh=(h-p.b)-by,opacity=c[0]==='Current'?1:.72;bars+=`<rect x="${bx}" y="${by}" width="${barW}" height="${bh}" rx="4" fill="${colors[j]}" opacity="${opacity}"/><text class="scenario-value" x="${bx+barW/2}" y="${Math.max(12,by-5)}" text-anchor="middle">${v.toFixed(0)}%</text>`});labels+=`<text class="scenario-bar-label" x="${cx}" y="${h-12}" text-anchor="middle">${c[0]}</text>`});
 const legend=`<g transform="translate(${p.l+8},4)"><rect x="0" y="0" width="9" height="9" rx="2" fill="${colors[0]}"/><text class="axis-text" x="14" y="8">Revenue</text><rect x="80" y="0" width="9" height="9" rx="2" fill="${colors[1]}"/><text class="axis-text" x="94" y="8">EBITDA</text><rect x="158" y="0" width="9" height="9" rx="2" fill="${colors[2]}"/><text class="axis-text" x="172" y="8">Ending Cash</text></g>`;
 target.innerHTML=`<svg class="chart-svg" viewBox="0 0 ${w} ${h}" aria-label="Scenario outcomes as percent of budget">${grid}<line x1="${p.l}" x2="${w-p.r}" y1="${y(100)}" y2="${y(100)}" stroke="#7d93a0" stroke-width="1.4" stroke-dasharray="5 5"/>${bars}${labels}${legend}</svg>`;
}
function renderScenario(){const x=calculateScenario();updateScenarioOutputsLabel(x);renderThresholds(x);renderScenarioImpact(x);renderScenarioNarrative(x);renderScenarioTable(x);renderScenarioOutcomeChart(x)}

function updateImplication(){const x=getScope();let t='The apparent revenue miss understates the issue. Margin compression and slower collections are creating a materially larger earnings and liquidity problem.';if(x.bu==='Field Services'||x.rg==='Northeast')t='The primary management issue is operating execution: utilization, overtime and subcontractor economics are depressing EBITDA faster than revenue.';if(x.bu==='Digital & Advisory')t='The selected scope is outperforming plan. Management should test whether incremental capacity can be deployed without diluting the unit’s attractive margin profile.';document.getElementById('managementImplication').textContent=t}
function updateAll(){updateKPIs();updateImplication()}
function setView(view){
 document.querySelectorAll('.tab[data-view]').forEach(x=>x.classList.toggle('active',x.dataset.view===view));document.querySelectorAll('.view').forEach(v=>v.classList.toggle('active',v.id===view));
 const scenarioMode=view==='forecast';['buFilter','regionFilter'].forEach(id=>{const e=document.getElementById(id);e.disabled=scenarioMode;e.closest('.filter').classList.toggle('is-muted',scenarioMode)});if(view==='forecast')renderScenario();
}

document.querySelectorAll('.tab[data-view]').forEach(b=>b.addEventListener('click',()=>setView(b.dataset.view)));
document.getElementById('buFilter').addEventListener('change',updateAll);document.getElementById('regionFilter').addEventListener('change',updateAll);
document.querySelectorAll('.scenario-btn').forEach(b=>b.addEventListener('click',()=>applyPreset(b.dataset.scenario)));
['pricingInput','volumeInput','laborInput','utilInput','dsoInput','digitalInput'].forEach(id=>document.getElementById(id).addEventListener('input',renderScenario));
document.getElementById('resetScenario').addEventListener('click',()=>applyPreset(selectedScenario));

svgLineChart(document.getElementById('revenueChart'),D.monthly.revA,D.monthly.revB);renderWaterfall();renderBUTable();renderMatrix();renderCashBridge();renderAging();renderCashForecast();renderCollections();updateAll();applyPreset('Base Case');
