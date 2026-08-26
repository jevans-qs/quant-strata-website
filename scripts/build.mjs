import { cp, mkdir, rm, writeFile } from "node:fs/promises";
import { pages } from "../src/pages.mjs";

const out = new URL("../docs/", import.meta.url);
await rm(out, { recursive: true, force: true });
await mkdir(out, { recursive: true });

const nav = [
  ["Business Advisory", "business-advisory"],
  ["Analytics & Technology", "analytics-technology"],
  ["Industries", "industries"],
  ["Insights", "insights"],
  ["About", "about"],
];

const brand = (prefix) => `<a class="brand" href="${prefix}"><span class="brand-mark"><i></i><i></i><i></i></span><span class="brand-type"><strong>QUANT STRATA</strong><small>ADVISORY + ANALYTICS</small></span></a>`;

function shell(page) {
  const prefix = page.depth ? "../" : "./";
  const links = nav.map(([label, route]) => `<a href="${prefix}${route}/">${label}</a>`).join("");
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${page.title}</title>
  <meta name="description" content="${page.description}">
  <meta name="theme-color" content="#06243c">
  <link rel="stylesheet" href="${prefix}styles.css">
</head>
<body>
  <a class="skip-link" href="#main">Skip to Main Content</a>
  <header class="site-header"><div class="page-width header-inner">${brand(prefix)}<nav class="desktop-nav" aria-label="Primary Navigation">${links}</nav><a class="header-cta" href="${prefix}contact/">Let’s Talk →</a><details class="mobile-menu"><summary>Menu</summary><nav aria-label="Mobile Navigation">${links}<a href="${prefix}contact/">Contact</a></nav></details></div></header>
  <main id="main">${page.content}</main>
  <footer class="site-footer"><div class="page-width footer-grid"><div class="footer-brand">${brand(prefix)}<p>Business Advisory and Advanced Analytics for organizations that need clarity, accountability, and decision-ready insight.</p><span>Veteran & Minority-Owned · Philadelphia, PA</span></div><div><h2>Capabilities</h2><a href="${prefix}business-advisory/">Business Advisory</a><a href="${prefix}analytics-technology/">Analytics & Technology</a><a href="${prefix}industries/">Industries</a><a href="${prefix}insights/">Insights</a></div><div><h2>Company</h2><a href="${prefix}about/">About Quant Strata</a><a href="${prefix}contact/">Contact</a><a href="mailto:info@q-strata.com">info@q-strata.com</a><a href="tel:2152783518">(215) 278-3518</a><span class="footer-location">Philadelphia, PA</span></div></div><div class="page-width footer-legal"><p>© 2026 Quant Strata LLC. All Rights Reserved.</p><p>Quant Strata is a business consulting firm, not a CPA firm or law firm. Services do not include audits, attest services, legal opinions, or unauthorized representation before taxing authorities.</p></div></footer>
</body>
</html>`;
}

for (const page of pages) {
  const dir = page.route ? new URL(`${page.route}/`, out) : out;
  await mkdir(dir, { recursive: true });
  await writeFile(new URL("index.html", dir), shell(page));
}

await cp(new URL("../src/styles.css", import.meta.url), new URL("styles.css", out));
await writeFile(new URL(".nojekyll", out), "");
