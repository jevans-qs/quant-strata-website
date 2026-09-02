const emailLink = '<a href="mailto:info@q-strata.com">info@q-strata.com</a>';

const iconPaths = {
  advisory: '<rect x="4" y="3" width="16" height="18" rx="2"></rect><path d="M8 7h8M8 11h3M8 15v2M12 13v4M16 10v7"></path>',
  analytics: '<path d="M4 20V5M4 20h16"></path><path d="m7 16 4-5 3 2 4-6"></path><circle cx="7" cy="16" r="1"></circle><circle cx="11" cy="11" r="1"></circle><circle cx="14" cy="13" r="1"></circle><circle cx="18" cy="7" r="1"></circle>',
  business: '<path d="M4 21V7l8-4 8 4v14M8 10h2M14 10h2M8 14h2M14 14h2M10 21v-3h4v3"></path>',
  public: '<path d="m3 9 9-5 9 5M5 10h14M6 10v8M10 10v8M14 10v8M18 10v8M4 18h16M3 21h18"></path>',
  nonprofit: '<path d="M12 20s-7-4.35-7-10a4 4 0 0 1 7-2.65A4 4 0 0 1 19 10c0 5.65-7 10-7 10Z"></path><path d="M8.5 12.5 11 15l4.5-5"></path>',
  diagnose: '<circle cx="12" cy="12" r="7"></circle><circle cx="12" cy="12" r="2"></circle><path d="M12 2v3M12 19v3M2 12h3M19 12h3"></path>',
  design: '<path d="m12 3-9 5 9 5 9-5-9-5Z"></path><path d="m3 12 9 5 9-5M3 16l9 5 9-5"></path>',
  deliver: '<rect x="4" y="4" width="16" height="16" rx="2"></rect><path d="m8 12 3 3 5-6"></path>',
  strengthen: '<path d="M4 19V5M4 19h16"></path><path d="m7 15 4-4 3 2 5-6M15 7h4v4"></path>',
  compliance: '<path d="M12 3 5 6v5c0 4.6 2.9 8.2 7 10 4.1-1.8 7-5.4 7-10V6l-7-3Z"></path><path d="m9 12 2 2 4-5"></path>'
};

const icon = (name) => `<svg class="line-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round">${iconPaths[name]}</svg>`;

const interiorHero = (label, title, summary) => `
  <section class="interior-hero">
    <div class="page-width">
      <p class="breadcrumbs"><a href="../">Home</a> / ${label}</p>
      <h1>${title}</h1>
      <p class="hero-summary">${summary}</p>
    </div>
  </section>`;

const closingCTA = () => `
  <section class="closing-cta">
    <div class="page-width cta-inner">
      <div><p class="eyebrow">Bring Us the Decision in Front of You.</p><h2>Let’s Turn Complexity Into a Clear Next Move.</h2></div>
      <a class="button button-light" href="../contact/">Start a Conversation →</a>
    </div>
  </section>`;

const cards = (items, className = "capability-grid") => `
  <div class="${className}">${items.map(([title, copy], index) => `
    <article class="capability-item"><span class="number">0${index + 1}</span><h2>${title}</h2><p>${copy}</p></article>`).join("")}
  </div>`;

const flagshipCards = (prefix) => `
  <div class="flagship-offer-grid">
    <article class="flagship-offer-card"><span>01 · Corporate Anchor</span><h3>Managed Finance &amp; Performance Intelligence</h3><p>Recurring management reporting, driver analysis, rolling forecasts, executive commentary, and a disciplined decision cadence.</p><a href="${prefix}managed-performance-intelligence/">Explore the Offer →</a></article>
    <article class="flagship-offer-card public-card"><span>02 · Government Anchor</span><h3>Public Program &amp; Procurement Analytics</h3><p>Spend, supplier, grant, program, and compliance intelligence designed for accountability and continuous improvement.</p><a href="${prefix}public-program-procurement-analytics/">Explore the Offer →</a></article>
    <article class="flagship-offer-card feasibility-card"><span>03 · Strategic Entry</span><h3>Feasibility, Economic &amp; Strategic Analysis</h3><p>Independent market, financial, economic, scenario, and risk analysis for defensible go/no-go decisions.</p><a href="${prefix}feasibility-economic-strategic-analysis/">Explore the Offer →</a></article>
  </div>`;

const offerPage = ({ name, label, heroTitle, summary, modifier, buyers, cadence, engagement, challengeTitle, challengeCopy, signals, deliverables, pathway, outcomeTitle, outcomeCopy }) => `
  <section class="offer-hero ${modifier}">
    <div class="page-width offer-hero-grid">
      <div>
        <p class="breadcrumbs"><a href="../">Home</a> / <a href="../services/">Services</a> / ${name}</p>
        <p class="offer-label">${label}</p>
        <h1>${heroTitle}</h1>
        <p class="offer-summary">${summary}</p>
        <div class="hero-actions"><a class="button button-primary" href="../contact/">Start a Scoping Conversation →</a><a class="button button-ghost" href="#deliverables">Review Deliverables</a></div>
      </div>
      <aside class="offer-snapshot" aria-label="${name} engagement summary">
        <p>Decision Brief</p><h2>${name}</h2>
        <dl><div><dt>Primary Buyers</dt><dd>${buyers}</dd></div><div><dt>Cadence</dt><dd>${cadence}</dd></div><div><dt>Engagement</dt><dd>${engagement}</dd></div></dl>
      </aside>
    </div>
  </section>
  <section class="offer-proof-band"><div class="page-width"><p>Finance + Analytics + Executive Communication</p><span>Defined Scope</span><span>Transparent Assumptions</span><span>Decision-Ready Deliverables</span></div></section>
  <section class="interior-section page-width offer-problem">
    <div><p class="eyebrow dark">The Business Challenge</p><h2>${challengeTitle}</h2><p class="offer-body-copy">${challengeCopy}</p></div>
    <div class="offer-signals"><p>Designed for organizations experiencing:</p>${signals.map((signal, index) => `<div><span>0${index + 1}</span><p>${signal}</p></div>`).join("")}</div>
  </section>
  <section class="interior-section tinted" id="deliverables"><div class="page-width"><div class="offer-section-heading"><div><p class="eyebrow dark">What the Engagement Delivers</p><h2>${outcomeTitle}</h2></div><p>${outcomeCopy}</p></div><div class="offer-deliverable-grid">${deliverables.map(([title, copy], index) => `<article><span>0${index + 1}</span><h3>${title}</h3><p>${copy}</p></article>`).join("")}</div></div></section>
  <section class="interior-section page-width"><div class="offer-section-heading"><div><p class="eyebrow dark">Engagement Pathway</p><h2>Move from a defined question to an operating capability.</h2></div><p>Each phase produces usable work while establishing the foundation for the next level of support.</p></div><ol class="offer-pathway-grid">${pathway.map(([stage, timing, copy], index) => `<li><span>0${index + 1}</span><small>${timing}</small><h3>${stage}</h3><p>${copy}</p></li>`).join("")}</ol></section>
  ${closingCTA()}`;

const home = `
  <section class="brand-banner" aria-label="Quant Strata Business Advisory and Analytics in Philadelphia">
    <img src="./assets/quant-strata-philadelphia-banner-v2.webp" width="2048" height="1152" alt="Quant Strata Business Advisory and Analytics with the Philadelphia skyline" fetchpriority="high" decoding="async">
  </section>
  <section class="hero">
    <div class="hero-grid page-width">
      <div class="hero-copy">
        <p class="eyebrow">Business Advisory · Analytics · Philadelphia</p>
        <h1>Clarity for the Numbers.<span> Intelligence for the Decision.</span></h1>
        <p class="hero-lede">Quant Strata connects finance, accounting operations, and advanced analytics so leaders can understand performance, strengthen compliance, and move forward with evidence.</p>
        <div class="hero-actions"><a class="button button-primary" href="./contact/">Start a Conversation →</a><a class="button button-ghost" href="./services/">Explore Our Services</a></div>
        <div class="credibility-line" aria-label="Quant Strata credentials"><span><i></i>Philadelphia Based</span><span><i></i>Veteran & Minority-Owned</span><span><i></i>15+ Years of Experience</span><span><i></i>Finance + Operations + Analytics</span></div>
      </div>
      <div class="decision-panel" aria-label="Illustrative Executive Decision Dashboard">
        <div class="panel-topline"><div><p>Decision System</p><strong>Executive View</strong></div><span class="live-pill"><i></i> Integrated</span></div>
        <div class="metric-row"><div><span>Financial</span><strong>Actuals</strong><small>Clear Close</small></div><div><span>Forward</span><strong>Forecast</strong><small>Scenario Ready</small></div><div><span>Control</span><strong>Governance</strong><small>Documented</small></div></div>
        <div class="chart-card"><div class="chart-label"><span>Performance Signal</span><small>Plan vs. Outlook</small></div><div class="mini-chart"><i class="line"></i><i class="plan-line"></i></div><div class="legend"><span><i class="cyan-dot"></i>Outlook</span><span><i class="steel-dot"></i>Plan</span></div></div>
        <div class="panel-footer">Finance + Operations + Data, Aligned in One View</div>
      </div>
    </div>
  </section>
  <section class="proof-band"><div class="page-width proof-grid"><p>Built for Organizations Where the Quality of the Decision Matters.</p><div><strong>Private</strong><span>Enterprise</span></div><div><strong>Public</strong><span>Institutions</span></div><div><strong>Mission</strong><span>Driven</span></div></div></section>
  <section class="section flagship-offers-section"><div class="page-width"><div class="flagship-offer-heading"><div><p class="eyebrow dark">Flagship Offers</p><h2>Defined Solutions for the Decisions That Matter Most.</h2></div><p>Each offer combines financial understanding, advanced analytics, and executive communication within a clear engagement model.</p></div>${flagshipCards("./")}</div></section>
  <section class="section page-width">
    <div class="section-heading split-heading"><div><p class="eyebrow dark">Two Disciplines. One Operating View.</p><h2>Advisory Depth Meets Analytical Precision.</h2></div><p>Engage Quant Strata for a focused project or combine capabilities into an ongoing decision-support partnership.</p></div>
    <div class="pathway-grid">
      <article class="pathway-card advisory-card"><div class="pathway-icon">${icon("advisory")}</div><p class="card-kicker">Business Advisory</p><h3>Stronger Finance Operations and Clearer Accountability.</h3><p>Practical support that helps leadership improve reporting, planning, compliance, and the financial processes behind daily operations.</p><ul><li>Accounting Operations and Management Reporting</li><li>FP&amp;A, Cash-Flow Forecasting, and Scenario Planning</li><li>Nonprofit Formation and Compliance Support</li><li>Controls, Documentation, and Audit Readiness</li></ul><a href="./business-advisory/">Explore Business Advisory →</a></article>
      <article class="pathway-card analytics-card"><div class="pathway-icon">${icon("analytics")}</div><p class="card-kicker">Analytics & Technology</p><h3>Data Translated Into Decisions Leaders Can Defend.</h3><p>Advanced models, dashboards, and integrated reporting that turn complex information into a trusted management resource.</p><ul><li>Executive Dashboards and KPI Architecture</li><li>Predictive, Statistical, and Financial Modeling</li><li>Data Integration, Automation, and Reporting</li><li>Economic, Market, and Geospatial Analysis</li></ul><a href="./analytics-technology/">Explore Analytics & Technology →</a></article>
    </div>
  </section>
  <section class="section sectors-section"><div class="page-width"><div class="section-heading centered-heading"><p class="eyebrow dark">Who We Serve</p><h2>Experience Across Commercial, Public, and Mission-Driven Organizations.</h2></div><div class="sector-grid"><article class="sector-card"><div class="sector-icon">${icon("business")}</div><h3>Businesses & Contractors</h3><p>Finance infrastructure, management insight, and scalable reporting for organizations ready to operate with greater control.</p></article><article class="sector-card"><div class="sector-icon">${icon("public")}</div><h3>Government & Institutions</h3><p>Transparent analysis, performance measurement, and decision support for public and regulated environments.</p></article><article class="sector-card"><div class="sector-icon">${icon("nonprofit")}</div><h3>Nonprofits & Associations</h3><p>Formation, reporting, governance, and analytics support designed around mission, accountability, and compliance.</p></article></div></div></section>
  <section class="section page-width operating-section"><div class="operating-copy"><p class="eyebrow dark">The Quant Strata Approach</p><h2>Start With the Business Question—Not the Software.</h2><p>We define the decision, establish what reliable evidence looks like, and build the analysis or operating process around the people who must use it.</p><a class="text-link" href="./about/">About Quant Strata →</a></div><ol class="process-list"><li><div class="process-marker"><span>01</span>${icon("diagnose")}</div><div><strong>Diagnose</strong><p>Clarify the decision, constraint, stakeholders, and required outcome.</p></div></li><li><div class="process-marker"><span>02</span>${icon("design")}</div><div><strong>Design</strong><p>Define the reporting, controls, model, or analytical solution.</p></div></li><li><div class="process-marker"><span>03</span>${icon("deliver")}</div><div><strong>Deliver</strong><p>Implement a practical resource your team can understand and maintain.</p></div></li><li><div class="process-marker"><span>04</span>${icon("strengthen")}</div><div><strong>Strengthen</strong><p>Measure adoption, refine the process, and support the next decision.</p></div></li></ol></section>
  <section class="closing-cta"><div class="page-width cta-inner"><div><p class="eyebrow">Bring Us the Decision in Front of You.</p><h2>Let’s Turn Complexity Into a Clear Next Move.</h2></div><a class="button button-light" href="./contact/">Start a Conversation →</a></div></section>`;

const businessAdvisory = `${interiorHero("Business Advisory", "Financial Operations Built for Control, Insight, and Growth.", "Quant Strata helps businesses and nonprofit organizations strengthen the processes behind accounting, planning, compliance, and management decision-making.")}
  <section class="interior-section page-width"><div class="interior-intro"><h2>Practical Support for the Work Behind the Numbers.</h2><p>Our advisory work connects accurate financial information with disciplined operating processes. The goal is not simply to produce reports—it is to help leadership understand what is happening, prepare for what is next, and maintain documentation that stands up to review.</p></div>${cards([["Accounting Operations","Month-end close support, reconciliations, financial schedules, management reporting, and process documentation."],["FP&A and Decision Support","Budgets, forecasts, cash-flow planning, performance analysis, and scenarios that give leadership a forward view."],["Fractional Finance Support","Flexible controller-level support and financial operating discipline without the cost of a full internal department."],["Tax-Ready Organization","Clean records, organized documentation, schedules, and coordination support that prepare the business for its licensed tax professional."],["Nonprofit Compliance","Formation and exemption-application support, annual reporting preparation, governance policies, and compliance calendars."],["Controls and Readiness","Internal-control documentation, policy development, audit-preparedness support, and remediation planning."]])}</section>
  <section class="interior-section tinted"><div class="page-width"><div class="interior-intro"><h2>Engagements Shaped Around the Organization.</h2><p>Support may be delivered as a defined project, a recurring monthly engagement, or a broader advisory relationship aligned with management’s priorities and internal capacity.</p></div><ul class="deliverables"><li>Accounting Close and Reporting Packages</li><li>Budget and Rolling-Forecast Models</li><li>Cash-Flow and Scenario Planning</li><li>Policies and Process Documentation</li><li>Nonprofit Formation and Annual Compliance Support</li><li>Audit and Tax-Preparation Readiness Schedules</li></ul></div></section>${closingCTA()}`;

const analytics = `${interiorHero("Analytics & Technology", "Turn Complex Data Into a Trusted Management Resource.", "From executive dashboards to advanced quantitative models, Quant Strata builds analytical systems around the decision your organization needs to make.")}
  <section class="interior-section page-width"><div class="interior-intro"><h2>Technology Should Make the Answer Clearer.</h2><p>We combine business context, quantitative rigor, and clear visualization. Every solution is designed to improve how information moves—from the underlying source through analysis and into the hands of the people accountable for action.</p></div>${cards([["Executive Dashboards","KPI frameworks and leadership dashboards in Power BI, Tableau, Qlik, and tailored web applications."],["Forecasting and Modeling","Statistical, financial, predictive, optimization, and scenario models that support defensible decisions."],["Data Integration","Connected reporting across finance, HR, procurement, operations, and external data sources."],["Automation","Repeatable reporting pipelines and analytical workflows that reduce manual effort and improve consistency."],["Economic and Market Analysis","Market sizing, competitive research, feasibility studies, program evaluation, and economic analysis."],["GIS and Location Intelligence","Geospatial analysis, mapping, site assessment, catchment studies, and location-based decision support."]])}</section>
  <section class="interior-section tinted"><div class="page-width"><div class="interior-intro"><h2>Tools Selected for the Problem.</h2><p>Our experience spans modern business intelligence, programming, modeling, data engineering, and cloud environments.</p></div><ul class="deliverables"><li>Power BI, Tableau, and Qlik Dashboards</li><li>R, Python, SQL, and Statistical Modeling</li><li>Financial and Operational Forecasting</li><li>Automated Management Reporting</li><li>Cloud and Database Integration</li><li>Executive-Ready Visual Communication</li></ul></div></section>${closingCTA()}`;

const industries = `${interiorHero("Industries", "Built for Organizations With Complex Decisions and Real Accountability.", "Quant Strata serves commercial, public, regulated, and mission-driven organizations that need both technical depth and practical business judgment.")}
  <section class="interior-section page-width"><div class="industry-grid">${[["Small & Midsize Businesses","Finance operations, forecasting, dashboards, and advisory support that help growing organizations build the discipline needed to scale."],["Nonprofits & Associations","Formation, exemption and annual filing support, governance policies, management reporting, impact measurement, and board-ready insight."],["Government & Public Sector","Performance analytics, economic research, program evaluation, geospatial analysis, and transparent reporting for public accountability."],["Government Contractors","Reporting infrastructure, financial controls, operational metrics, and compliance-readiness support for organizations serving public clients."],["Regulated Finance Teams","Finance transformation, data governance, planning, controls, and executive decision support in complex operating environments."],["Healthcare & Education","Access, demand, workforce, financial, and performance analysis for institutions accountable to diverse stakeholders."]].map(([title,copy],i)=>`<article class="industry-card"><span>0${i+1}</span><h2>${title}</h2><p>${copy}</p></article>`).join("")}</div></section>${closingCTA()}`;

const insights = `${interiorHero("Insights", "Useful Analysis for Leaders Responsible for the Next Decision.", "Quant Strata insights translate technical finance, analytics, and compliance topics into practical guidance for business and nonprofit leaders.")}
  <section class="interior-section page-width"><div class="interior-intro"><h2>An Evidence-Led Resource Library.</h2><div class="insight-intro"><p>We are organizing original articles, briefings, and practical guides around the questions our clients face most often. Published work will be clearly distinguished from client engagements and will not disclose confidential information.</p><div class="insight-note">This section is reserved for verified, publishable material so the website never implies client results that have not been documented and approved.</div></div></div><div class="insight-grid"><article class="insight-card"><div class="insight-cover finance-cover">${icon("advisory")}<span>Finance & Advisory</span></div><div class="insight-card-body"><p class="series-label">Editorial Series</p><h2>Finance & Advisory</h2><p>Practical guidance on management reporting, forecasting, accounting operations, controls, and financial decision-making.</p></div></article><article class="insight-card"><div class="insight-cover analytics-cover">${icon("analytics")}<span>Analytics & Business Intelligence</span></div><div class="insight-card-body"><p class="series-label">Editorial Series</p><h2>Analytics & Business Intelligence</h2><p>Perspectives on dashboard design, KPI governance, modeling, automation, and communicating evidence to leadership.</p></div></article><article class="insight-card"><div class="insight-cover compliance-cover">${icon("compliance")}<span>Nonprofit & Compliance</span></div><div class="insight-card-body"><p class="series-label">Editorial Series</p><h2>Nonprofit & Compliance</h2><p>Clear explanations of formation, exemption applications, annual reporting, governance, and operational compliance.</p></div></article></div></section>${closingCTA()}`;

const about = `${interiorHero("About", "Business Judgment, Analytical Rigor, and a Commitment to Useful Work.", "Quant Strata is a Philadelphia-based, veteran- and minority-owned advisory and analytics firm serving businesses, nonprofits, government entities, and institutional teams.")}
  <section class="interior-section page-width"><div class="interior-intro"><h2>Built to Connect Strategy With Execution.</h2><p>Organizations rarely struggle because they lack data. They struggle because financial processes, operating context, and analytical systems are disconnected. Quant Strata brings those disciplines together—helping leaders establish reliable information, interpret it correctly, and act with greater confidence.</p></div><div class="profile-strip"><div class="profile-monogram">QS</div><div><p class="eyebrow">Experience That Crosses Disciplines</p><h2>15+ Years Across Finance, Analytics, and Executive Decision Support.</h2><p>Quant Strata’s leadership experience includes FP&A, finance transformation, business intelligence, data integration, regulatory analytics, governance, and executive reporting.</p></div></div></section>
  <section class="interior-section tinted"><div class="page-width"><div class="interior-intro"><h2>Our Working Principles.</h2><p>Every engagement is grounded in clear scope, responsible professional boundaries, and practical transfer of knowledge to the client team.</p></div>${cards([["Clarity","Define the decision, deliverable, responsibilities, and limits of the engagement from the beginning."],["Rigor","Use traceable methods, documented assumptions, and evidence appropriate to the decision."],["Utility","Deliver work the client can understand, use, and maintain after the engagement."]])}</div></section>${closingCTA()}`;

const services = `${interiorHero("Services", "Advisory and Analytics, Designed to Work Together.", "Choose a defined offer or combine capabilities into an integrated engagement spanning finance operations, public accountability, strategic analysis, and advanced analytics.")}
  <section class="interior-section flagship-offers-section"><div class="page-width"><div class="flagship-offer-heading"><div><p class="eyebrow dark">Flagship Offers</p><h2>Three Defined Solutions for Recurring Performance, Public Accountability, and Consequential Decisions.</h2></div><p>Each offer begins with a clear business question, produces decision-ready deliverables, and can expand into an ongoing relationship.</p></div>${flagshipCards("../")}</div></section>
  <section class="interior-section page-width"><div class="supporting-capabilities-heading"><p class="eyebrow dark">Supporting Capabilities</p><h2>Flexible Expertise Beneath the Flagship Offers.</h2></div><div class="pathway-grid"><article class="pathway-card advisory-card"><div class="pathway-icon">${icon("advisory")}</div><p class="card-kicker">Business Advisory</p><h3>Build Stronger Financial Operations.</h3><p>Accounting support, management reporting, FP&amp;A, controls, nonprofit compliance, and readiness services.</p><a href="../business-advisory/">View Business Advisory →</a></article><article class="pathway-card analytics-card"><div class="pathway-icon">${icon("analytics")}</div><p class="card-kicker">Analytics & Technology</p><h3>Make Complex Data Decision-Ready.</h3><p>Dashboards, modeling, automation, research, and integrated analytical systems for leadership.</p><a href="../analytics-technology/">View Analytics & Technology →</a></article></div></section>${closingCTA()}`;

const managedPerformance = offerPage({
  name: "Managed Finance &amp; Performance Intelligence",
  label: "Flagship Corporate Offer",
  heroTitle: "A Clear Financial Picture. <span>A Forward View.</span>",
  summary: "Quant Strata gives executives a reliable management system for understanding performance, anticipating change, and turning financial and operational insight into accountable action.",
  modifier: "managed-offer",
  buyers: "CFO · FP&amp;A · COO",
  cadence: "Monthly + Quarterly",
  engagement: "Diagnose · Build · Operate",
  challengeTitle: "Reporting often arrives after the decision has already been made.",
  challengeCopy: "Leadership teams may receive plenty of information and still lack consistent answers to the questions that matter: What changed? Why did it change? What is likely to happen next? Who needs to act?",
  signals: ["Recurring manual reporting and too much time spent assembling data.", "Conflicting metrics or limited confidence in management reports.", "Forecasts that are static, late, or disconnected from operating drivers.", "Executive meetings that review results without assigning clear action."],
  deliverables: [["Executive Performance Reporting", "A concise leadership view of revenue, cost, margin, cash, operating KPIs, and the issues requiring attention."], ["Rolling Forecasts & Scenarios", "Forward-looking models refreshed as assumptions, operating conditions, and management priorities change."], ["Driver & Variance Analysis", "Clear explanations of performance against plan and the underlying business drivers."], ["Cash, Cost & Margin Visibility", "Decision-ready analysis of liquidity, cost pressure, profitability, and resource tradeoffs."], ["Data Integration & Control", "A disciplined process that connects, reconciles, and documents information from existing systems."], ["Commentary & Action Log", "Written interpretation, documented decisions, responsible owners, and follow-through on priority actions."]],
  pathway: [["Diagnose", "Typically 3–4 Weeks", "Clarify leadership priorities, reporting needs, data sources, measures, and decision requirements."], ["Build", "Typically 6–10 Weeks", "Develop the performance pack, models, dashboards, controls, commentary, and review cadence."], ["Operate", "6- or 12-Month Engagement", "Refresh the intelligence, facilitate reviews, maintain forecasts, and improve the system."]],
  outcomeTitle: "A Management Capability—Not a One-Time Dashboard.",
  outcomeCopy: "Financial analysis, integrated reporting, forecasting, executive interpretation, and an operating cadence leadership can rely on month after month."
});

const publicProgram = offerPage({
  name: "Public Program &amp; Procurement Analytics",
  label: "Flagship Government Offer",
  heroTitle: "Make Public Performance <span>Visible and Accountable.</span>",
  summary: "Quant Strata connects program, procurement, supplier, grant, and financial information so public leaders can strengthen oversight, demonstrate results, and act on emerging risks.",
  modifier: "public-offer",
  buyers: "Agencies · Authorities · Primes",
  cadence: "Monthly · Quarterly · Annual",
  engagement: "Direct · Task Order · Subcontract",
  challengeTitle: "Required reporting can document activity without showing whether the program is working.",
  challengeCopy: "Public organizations often manage information across procurement, finance, grants, contracts, and program systems. Decision-makers need a defensible view that connects expenditures, supplier performance, participation, and outcomes to management action.",
  signals: ["Spend, supplier, contract, and program data maintained in separate systems.", "Reporting obligations that consume time without creating management insight.", "Limited visibility into supplier concentration, utilization, participation, or risk.", "Performance measures that are not consistently tied to corrective action."],
  deliverables: [["Spend & Category Intelligence", "Analysis of expenditures, categories, concentration, trends, and procurement opportunities."], ["Supplier Performance & Risk", "Monitoring of supplier delivery, participation, diversity, exceptions, and emerging risk."], ["Program Outcomes & Benchmarks", "Documented measures, trends, cost-per-result analysis, and comparison points."], ["Grant & Compliance Evidence", "Reporting schedules, evidence trails, controls, and documented definitions."], ["Executive & Public Dashboards", "Clear views designed for management oversight and stakeholder transparency."], ["Corrective-Action Tracking", "Ownership, milestones, exceptions, and follow-through connected to the evidence."]],
  pathway: [["Assess", "Typically 3–5 Weeks", "Define reporting obligations, stakeholders, measures, data limitations, and governance needs."], ["Build", "Typically 6–12 Weeks", "Create the analytical model, documented measures, dashboards, controls, and reporting process."], ["Operate", "Monthly, Quarterly, or Annual", "Maintain reporting, monitor performance, facilitate reviews, and track corrective action."]],
  outcomeTitle: "Defensible Reporting Connected to Continuous Improvement.",
  outcomeCopy: "The engagement creates repeatable evidence, greater transparency across spend and outcomes, and a management process that connects findings to action."
});

const feasibility = offerPage({
  name: "Feasibility, Economic &amp; Strategic Analysis",
  label: "Flagship Strategic Offer",
  heroTitle: "Test the Decision Before <span>Committing the Resources.</span>",
  summary: "Quant Strata provides independent market, financial, economic, operating, and risk analysis for organizations evaluating investments, programs, facilities, new markets, and strategic growth.",
  modifier: "feasibility-offer",
  buyers: "Executives · Strategy · Sponsors",
  cadence: "Typically 6–10 Weeks",
  engagement: "Study · Mobilize · Realize",
  challengeTitle: "A compelling idea is not yet a defensible investment case.",
  challengeCopy: "Leadership needs transparent evidence about demand, financial economics, operating capacity, uncertainty, risk, and the conditions that must be true for successful execution.",
  signals: ["A decision involving significant capital, operating expense, funding, or capacity.", "Uncertain demand, incomplete information, or assumptions that require testing.", "Multiple stakeholders with different financial, operating, or public priorities.", "A need for independent analysis and a documented go/no-go recommendation."],
  deliverables: [["Market & Demand Assessment", "Customer, competitor, geographic, industry, and demand evidence relevant to the decision."], ["Financial & Economic Model", "Revenue, cost, cash flow, break-even, return, funding, and economic implications."], ["Operating Capacity Analysis", "Resource, workforce, technology, partnership, and execution requirements."], ["Scenarios & Sensitivities", "Base, upside, downside, threshold, and sensitivity testing of critical assumptions."], ["Risk & Decision Conditions", "Material risks, dependencies, constraints, and conditions required to proceed."], ["Recommendation & Roadmap", "A clear go, no-go, or conditional recommendation with an implementation path."]],
  pathway: [["Study", "Typically 6–10 Weeks", "Build the market, financial, operating, scenario, and risk case for an independent decision."], ["Mobilize", "90-Day Roadmap", "Translate an approved decision into workstreams, milestones, ownership, and resource needs."], ["Realize", "Quarterly Benefits Tracking", "Monitor assumptions, implementation progress, realized benefits, and course corrections."]],
  outcomeTitle: "A Decision Case Built on Transparent Assumptions.",
  outcomeCopy: "Market evidence, financial logic, operating realities, scenarios, and risk are brought into one coherent recommendation leadership can inspect and defend."
});

const contact = `${interiorHero("Contact", "Let’s Discuss the Decision, Process, or Problem in Front of You.", "Share what your organization is working through. Quant Strata will respond candidly about fit, scope, and the practical next step.")}
  <section class="interior-section page-width"><div class="contact-layout"><div class="contact-details"><div><span>Email</span><strong>${emailLink}</strong></div><a href="tel:2157308626"><span>Phone</span><strong>(215) 730-8626</strong></a><div><span>Location</span><strong>Philadelphia, Pennsylvania</strong></div><div><span>Business Hours</span><strong>Monday–Friday, 9:00 am–5:00 pm</strong></div></div><div class="intake-card"><h2>Help Us Understand Your Need.</h2><p>For the most useful first conversation, include:</p><ul><li>Your Organization and Industry</li><li>The Advisory or Analytics Support You Are Considering</li><li>The Decision, Deadline, or Compliance Requirement Involved</li><li>The Systems, Data, or Documentation Currently Available</li><li>Your Preferred Timeframe for Beginning the Engagement</li></ul><a class="button button-primary page-cta" href="mailto:info@q-strata.com?subject=Quant%20Strata%20Consultation%20Request">Email Quant Strata →</a></div></div></section>`;

export const pages = [
  { route: "", title: "Quant Strata Business Advisory & Analytics", description: "Business advisory, finance and accounting operations, compliance support, dashboards, forecasting, and advanced analytics.", content: home, depth: 0 },
  { route: "services", title: "Services | Quant Strata", description: "Integrated Business Advisory and Analytics services.", content: services, depth: 1 },
  { route: "business-advisory", title: "Business Advisory | Quant Strata", description: "Accounting operations, FP&A, nonprofit compliance, controls, and finance support.", content: businessAdvisory, depth: 1 },
  { route: "analytics-technology", title: "Analytics & Technology | Quant Strata", description: "Executive dashboards, forecasting, data integration, automation, research, and GIS.", content: analytics, depth: 1 },
  { route: "managed-performance-intelligence", title: "Managed Finance & Performance Intelligence | Quant Strata", description: "Recurring financial and operational performance intelligence for executives who need clearer reporting, stronger forecasts, and a reliable decision cadence.", content: managedPerformance, depth: 1 },
  { route: "public-program-procurement-analytics", title: "Public Program & Procurement Analytics | Quant Strata", description: "Program, procurement, supplier, grant, and financial intelligence for public accountability and continuous improvement.", content: publicProgram, depth: 1 },
  { route: "feasibility-economic-strategic-analysis", title: "Feasibility, Economic & Strategic Analysis | Quant Strata", description: "Independent market, financial, economic, scenario, and risk analysis for consequential organizational decisions.", content: feasibility, depth: 1 },
  { route: "industries", title: "Industries | Quant Strata", description: "Advisory and analytics for businesses, nonprofits, government, contractors, healthcare, and education.", content: industries, depth: 1 },
  { route: "insights", title: "Insights | Quant Strata", description: "Finance, analytics, and nonprofit compliance guidance for organizational leaders.", content: insights, depth: 1 },
  { route: "about", title: "About Quant Strata", description: "A Philadelphia-based, veteran- and minority-owned Business Advisory and Analytics firm.", content: about, depth: 1 },
  { route: "contact", title: "Contact Quant Strata", description: "Contact Quant Strata Business Advisory & Analytics in Philadelphia.", content: contact, depth: 1 },
];
