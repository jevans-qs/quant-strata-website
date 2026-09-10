/* Phase 08 — public-facing polish loaded after the validated app engines */
(() => {
  'use strict';
  const head=document.head;
  function meta(attr,key,value){
    let el=head.querySelector(`meta[${attr}="${key}"]`);
    if(!el){el=document.createElement('meta');el.setAttribute(attr,key);head.appendChild(el)}
    el.setAttribute('content',value);
  }
  function link(rel,href,attrs={}){
    let el=head.querySelector(`link[rel="${rel}"][href="${href}"]`);
    if(!el){el=document.createElement('link');el.rel=rel;el.href=href;Object.entries(attrs).forEach(([k,v])=>el.setAttribute(k,v));head.appendChild(el)}
  }
  let canonical=head.querySelector('link[rel="canonical"]');
  if(!canonical){canonical=document.createElement('link');canonical.rel='canonical';head.appendChild(canonical)}
  canonical.href='https://q-strata.com/corporate-finance-command-center/';
  meta('name','robots','index,follow');
  meta('name','referrer','strict-origin-when-cross-origin');
  meta('property','og:type','website');meta('property','og:site_name','Quant Strata');
  meta('property','og:title','Corporate Finance Decision Command Center | Quant Strata');
  meta('property','og:description','Explore a synthetic executive finance demo connecting performance, cash, forecasting, scenarios and accountable management action.');
  meta('property','og:url','https://q-strata.com/corporate-finance-command-center/');
  meta('property','og:image','https://q-strata.com/assets/social-preview.png');
  meta('name','twitter:card','summary_large_image');
  meta('name','twitter:title','Corporate Finance Decision Command Center | Quant Strata');
  meta('name','twitter:description','Interactive executive finance intelligence demo from Quant Strata.');
  meta('name','twitter:image','https://q-strata.com/assets/social-preview.png');
  link('icon','../assets/favicon-32.png',{'type':'image/png','sizes':'32x32'});
  link('apple-touch-icon','../assets/apple-touch-icon.png',{'sizes':'180x180'});
  link('manifest','../site.webmanifest');

  // Remove internal build-phase language from the prospect-facing experience without replacing live DOM nodes.
  const replacements=new Map([
    ['Approved Phase 02 anchors','Approved Planning Cases'],
    ['Phase 02 anchors','Reconciled planning cases'],
    ['Phase 02 Action Register','Management Action Register'],
    ['Phase 07 Complete','Closed-Loop Demo'],
    ['Phase 07 Decision & Action Center','Interactive Executive Proof Demo']
  ]);
  const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
  let node;while((node=walker.nextNode())){
    let text=node.nodeValue;let changed=false;
    replacements.forEach((to,from)=>{if(text.includes(from)){text=text.split(from).join(to);changed=true}});
    if(changed)node.nodeValue=text;
  }

  const decisionToolbar=document.querySelector('.decision-toolbar small');
  if(decisionToolbar)decisionToolbar.textContent='Impacts represent illustrative incremental benefits beyond the selected scenario assumptions; execution weighting reduces the risk of treating planned actions as certain.';

  const foot=document.querySelector('.demo-foot');
  if(foot){
    foot.innerHTML='Quant Strata Analytics · Corporate Finance Decision Command Center · Interactive Executive Proof Demo<br>All entities, transactions, values, forecasts and management situations are synthetic and illustrative. This demonstration is not financial advice and does not represent an actual client.';
    if(!document.querySelector('.demo-public-cta')){
      const cta=document.createElement('section');cta.className='demo-public-cta';cta.setAttribute('aria-labelledby','demoCtaTitle');
      cta.innerHTML='<div><p class="eyebrow">From Demonstration to Operating Capability</p><h2 id="demoCtaTitle">Build a Finance Decision System Around Your Business.</h2><p>Quant Strata can adapt the management logic demonstrated here to your financial model, operating drivers, reporting cadence, systems and leadership priorities.</p></div><div class="demo-cta-actions"><a class="demo-cta-primary" href="../contact/">Discuss Your Finance Decision System →</a><a class="demo-cta-secondary" href="../managed-performance-intelligence/">Explore the Service</a></div>';
      foot.before(cta);
    }
  }
})();
