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

const siteBase = "https://q-strata.com/";

const organizationSchema = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: "Quant Strata",
  legalName: "Quant Strata LLC",
  url: siteBase,
  logo: `${siteBase}assets/quant-strata-logo.png`,
  image: `${siteBase}assets/social-preview.png`,
  email: "info@q-strata.com",
  telephone: "+1-215-278-3518",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Philadelphia",
    addressRegion: "PA",
    addressCountry: "US"
  },
  areaServed: "United States",
  description: "Business Advisory and Advanced Analytics for businesses, nonprofits, government entities, and institutional teams."
}).replaceAll("<", "\\u003c");

const brand = (prefix) => `<a class="brand" href="${prefix}" aria-label="Quant Strata Home"><img class="brand-logo" src="${prefix}assets/quant-strata-logo.png" alt="Quant Strata"></a>`;

function shell(page) {
  const prefix = page.absolute ? "/" : page.depth ? "../" : "./";
  const canonicalPath = page.route ? `${page.route}/` : "";
  const canonicalUrl = `${siteBase}${canonicalPath}`;
  const socialImage = `${siteBase}assets/social-preview.png`;
  const links = nav.map(([label, route]) => `<a href="${prefix}${route}/">${label}</a>`).join("");
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${page.title}</title>
  <meta name="description" content="${page.description}">
  <meta name="theme-color" content="#06243c">
  <link rel="canonical" href="${canonicalUrl}">
  <link rel="icon" type="image/png" sizes="32x32" href="${prefix}assets/favicon-32.png">
  <link rel="icon" type="image/png" sizes="16x16" href="${prefix}assets/favicon-16.png">
  <link rel="apple-touch-icon" sizes="180x180" href="${prefix}assets/apple-touch-icon.png">
  <link rel="manifest" href="${prefix}site.webmanifest">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="Quant Strata">
  <meta property="og:title" content="${page.title}">
  <meta property="og:description" content="${page.description}">
  <meta property="og:url" content="${canonicalUrl}">
  <meta property="og:image" content="${socialImage}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="Quant Strata Business Advisory and Analytics">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${page.title}">
  <meta name="twitter:description" content="${page.description}">
  <meta name="twitter:image" content="${socialImage}">
  <script type="application/ld+json">${organizationSchema}</script>
  <link rel="stylesheet" href="${prefix}styles.css?v=20260827-3">
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
await cp(new URL("../src/assets/", import.meta.url), new URL("assets/", out), { recursive: true });
await writeFile(new URL(".nojekyll", out), "");
await writeFile(new URL("CNAME", out), "q-strata.com\n");

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map((page) => `  <url><loc>${siteBase}${page.route ? `${page.route}/` : ""}</loc><lastmod>2026-08-27</lastmod></url>`).join("\n")}
</urlset>\n`;
await writeFile(new URL("sitemap.xml", out), sitemap);
await writeFile(new URL("robots.txt", out), `User-agent: *\nAllow: /\nSitemap: ${siteBase}sitemap.xml\n`);
await writeFile(new URL("site.webmanifest", out), JSON.stringify({
  name: "Quant Strata",
  short_name: "Quant Strata",
  description: "Business Advisory and Advanced Analytics",
  start_url: "/",
  display: "standalone",
  background_color: "#ffffff",
  theme_color: "#06243c",
  icons: [
    { src: "/assets/favicon-192.png", sizes: "192x192", type: "image/png" },
    { src: "/assets/favicon-512.png", sizes: "512x512", type: "image/png" }
  ]
}, null, 2));

const notFound = {
  route: "404",
  depth: 0,
  absolute: true,
  title: "Page Not Found | Quant Strata",
  description: "The requested page could not be found.",
  content: `<section class="interior-hero"><div class="page-width"><p class="breadcrumbs"><a href="./">Home</a> / 404</p><h1>The Page You Requested Could Not Be Found.</h1><p class="hero-summary">The address may have changed. Return to the Quant Strata homepage or explore our advisory and analytics services.</p><div class="hero-actions"><a class="button button-primary" href="./">Return Home →</a><a class="button button-ghost" href="./services/">Explore Our Services</a></div></div></section>`
};
await writeFile(new URL("404.html", out), shell(notFound));
