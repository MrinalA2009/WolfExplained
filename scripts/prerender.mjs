/**
 * Pre-renders every app route to a static HTML file by calling the built
 * TanStack Start server's fetch() handler directly (no network involved).
 *
 * Run after `GITHUB_PAGES=true npm run build`.
 * Output: dist/client/<route>/index.html  (or dist/client/index.html for /)
 *
 * The server bundle uses Node.js APIs so this works in Node 18+.
 */

import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const ORIGIN = "https://mrinalA2009.github.io";
const BASE   = "/WolfExplained";

// Each route is rendered as BASE + route + "/"  (TanStack Start requires trailing slash)
const ROUTES = ["/", "/research", "/experience", "/workshops", "/about", "/citations"];

console.log("⚙  Pre-rendering routes for GitHub Pages…\n");

const { default: server } = await import(`${root}/dist/server/server.js`);

async function fetchRoute(url, depth = 0) {
  if (depth > 5) throw new Error(`Too many redirects for ${url}`);
  const request = new Request(url, {
    headers: { accept: "text/html", "user-agent": "prerender/1.0" },
    redirect: "manual",
  });
  const response = await server.fetch(request, {}, {});
  if (response.status >= 300 && response.status < 400) {
    const location = response.headers.get("location") ?? "";
    // Resolve relative redirects
    const next = location.startsWith("http") ? location : `${ORIGIN}${location}`;
    return fetchRoute(next, depth + 1);
  }
  return response;
}

for (const route of ROUTES) {
  // Ensure trailing slash — TanStack Start canonical URLs use it
  const path = BASE + (route === "/" ? "/" : route + "/");
  const url  = `${ORIGIN}${path}`;
  process.stdout.write(`  → ${route.padEnd(15)} `);

  let html;
  try {
    const response = await fetchRoute(url);
    if (response.status !== 200) {
      console.error(`HTTP ${response.status} (expected 200)`);
      process.exit(1);
    }
    html = await response.text();
  } catch (err) {
    console.error(`ERROR: ${err.message}`);
    process.exit(1);
  }

  const outFile =
    route === "/"
      ? join(root, "dist/client/index.html")
      : join(root, `dist/client${route}/index.html`);

  mkdirSync(dirname(outFile), { recursive: true });
  writeFileSync(outFile, html, "utf8");
  console.log(`✓  ${outFile.replace(root + "/", "")}`);
}

console.log("\n✅  Pre-rendering complete.\n");
