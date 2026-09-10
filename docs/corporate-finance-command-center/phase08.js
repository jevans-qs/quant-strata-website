/* Phase 08 — validation, accessibility and executive demo hardening */
(() => {
  'use strict';
  const views=['overview','performance','cash','forecast','decision'];
  const enterpriseViews=new Set(['cash','forecast','decision']);
  let currentView='overview';
  let savedScope=null;

  function announcer(){
    let el=document.getElementById('demoAnnouncer');
    if(!el){el=document.createElement('div');el.id='demoAnnouncer';el.className='sr-only';el.setAttribute('aria-live','polite');el.setAttribute('aria-atomic','true');document.body.appendChild(el)}
    return el;
  }
  function announce(text){const el=announcer();el.textContent='';setTimeout(()=>{el.textContent=text},20)}

  function syncTabSemantics(view){
    const tabs=[...document.querySelectorAll('.tab[data-view]')];
    tabs.forEach((tab,i)=>{
      const target=tab.dataset.view;
      tab.type='button';
      tab.id=`tab-${target}`;
      tab.setAttribute('role','tab');
      tab.setAttribute('aria-controls',target);
      tab.setAttribute('aria-selected',target===view?'true':'false');
      tab.tabIndex=target===view?0:-1;
      const panel=document.getElementById(target);
      if(panel){panel.setAttribute('role','tabpanel');panel.setAttribute('aria-labelledby',tab.id);panel.tabIndex=0;panel.hidden=target!==view}
    });
    const tablist=document.querySelector('.view-tabs');
    if(tablist)tablist.setAttribute('aria-label','Corporate Finance Decision Command Center views');
  }

  function setScopeMode(view,previous){
    const enterprise=enterpriseViews.has(view),wasEnterprise=enterpriseViews.has(previous);
    const bu=document.getElementById('buFilter'),region=document.getElementById('regionFilter'),controls=document.querySelector('.controls');
    if(!bu||!region)return;
    if(enterprise&&!wasEnterprise){
      savedScope={bu:bu.value,region:region.value};
      bu.value='Enterprise';region.value='All Regions';
      if(typeof updateAll==='function')updateAll();
    }else if(!enterprise&&wasEnterprise&&savedScope){
      bu.value=savedScope.bu;region.value=savedScope.region;savedScope=null;
      if(typeof updateAll==='function')updateAll();
    }
    [bu,region].forEach(el=>{el.disabled=enterprise;el.closest('.filter')?.classList.toggle('is-muted',enterprise);el.setAttribute('aria-disabled',enterprise?'true':'false');el.title=enterprise?'This module is modeled at enterprise level.':''});
    controls?.classList.toggle('enterprise-mode',enterprise);
  }

  const priorSetView=typeof setView==='function'?setView:null;
  if(priorSetView){
    setView=function(view){
      const previous=currentView;
      priorSetView(view);
      setScopeMode(view,previous);
      syncTabSemantics(view);
      currentView=view;
      const label=document.querySelector(`.tab[data-view="${view}"]`)?.textContent?.trim()||view;
      announce(`${label} view active.`);
    };
  }

  function addKeyboardTabs(){
    const tabs=[...document.querySelectorAll('.tab[data-view]')];
    tabs.forEach((tab,index)=>tab.addEventListener('keydown',e=>{
      let next=null;
      if(e.key==='ArrowRight')next=(index+1)%tabs.length;
      if(e.key==='ArrowLeft')next=(index-1+tabs.length)%tabs.length;
      if(e.key==='Home')next=0;
      if(e.key==='End')next=tabs.length-1;
      if(next!==null){e.preventDefault();tabs[next].focus();if(typeof setView==='function')setView(tabs[next].dataset.view)}
    }));
  }

  function hardenControls(){
    document.querySelectorAll('button').forEach(b=>b.type='button');
    const states=['scenarioState','decisionBaseState'];states.forEach(id=>{const e=document.getElementById(id);if(e){e.setAttribute('role','status');e.setAttribute('aria-live','polite')}});
    document.querySelectorAll('.table-wrap').forEach((wrap,i)=>{wrap.tabIndex=0;const h=wrap.closest('.card')?.querySelector('h3')?.textContent?.trim();if(h)wrap.setAttribute('aria-label',`${h} — scroll horizontally if needed`)});
    document.querySelectorAll('table.fin-table').forEach(table=>{if(!table.querySelector('caption')){const cap=document.createElement('caption');cap.className='sr-only';cap.textContent=table.closest('.card')?.querySelector('h3')?.textContent?.trim()||'Financial data table';table.prepend(cap)}});
    const chartLabels={revenueChart:'Monthly actual revenue versus budget, January through August 2026',cashBridge:'Bridge from expected August cash to actual cash',agingChart:'Accounts receivable aging by bucket',cashForecastChart:'Thirteen-week cash forecast comparing base outlook and collections action',scenarioOutcomeChart:'Scenario outcome comparison versus budget',scenarioDriverImpact:'Driver impact versus selected scenario preset',portfolioImpact:'Execution-weighted EBITDA and cash impact by management action',priorityMatrix:'Management action priority matrix'};
    Object.entries(chartLabels).forEach(([id,label])=>{const el=document.getElementById(id);if(el){el.setAttribute('role','img');el.setAttribute('aria-label',label)}});
    document.querySelectorAll('.assumption input[type="range"]').forEach(input=>{
      const output=input.closest('.assumption')?.querySelector('output');
      const name=input.closest('.assumption')?.querySelector('span')?.textContent?.trim()||'Management assumption';
      input.setAttribute('aria-label',name);
      if(output){output.setAttribute('for',input.id)}
      const sync=()=>{if(output)input.setAttribute('aria-valuetext',output.textContent.trim())};
      sync();input.addEventListener('input',sync);input.addEventListener('change',()=>{sync();announce(`${input.closest('.assumption')?.querySelector('span')?.textContent||'Assumption'} set to ${input.getAttribute('aria-valuetext')}.`)})
    });
  }

  function addReset(){
    const controls=document.querySelector('.controls-inner');
    if(!controls||document.getElementById('resetDemo'))return;
    const note=document.createElement('span');note.className='enterprise-scope-note';note.textContent='Enterprise-level module';note.setAttribute('aria-live','polite');controls.appendChild(note);
    const btn=document.createElement('button');btn.id='resetDemo';btn.className='demo-reset';btn.type='button';btn.textContent='Reset Demo';btn.title='Return to the default enterprise Base Case';
    btn.addEventListener('click',()=>{
      savedScope=null;
      const bu=document.getElementById('buFilter'),region=document.getElementById('regionFilter');if(bu)bu.value='Enterprise';if(region)region.value='All Regions';
      if(typeof updateAll==='function')updateAll();
      if(typeof applyPreset==='function')applyPreset('Base Case');
      if(typeof resetActionRegister==='function')resetActionRegister();
      if(typeof setView==='function')setView('overview');
      announce('Demo reset to Enterprise, All Regions, Base Case, and the default management action register.');
    });
    controls.appendChild(btn);
  }

  function markDynamicRegions(){
    ['scenarioNarrative','decisionNarrative','thresholdList','decisionForecast','accountabilitySnapshot'].forEach(id=>{const e=document.getElementById(id);if(e){e.setAttribute('aria-live','polite');e.setAttribute('aria-atomic','false')}});
  }

  syncTabSemantics('overview');
  addKeyboardTabs();
  hardenControls();
  addReset();
  markDynamicRegions();
  setScopeMode('overview','overview');
})();