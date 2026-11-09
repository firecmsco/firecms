import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

/**
 * Checks every internal <a href> in the built site (dist/) the way a browser resolves it:
 * against the page URL with its trailing slash. Reports links to pages that don't exist.
 * Also checks <link hreflang> alternates: Google crawls them, and the language redirect in
 * Layout.astro sends visitors to them.
 * Run after `npx astro build`: `node scripts/check_links.mjs`
 */

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, "../dist");
const siteOrigin = "https://firecms.co";

function listFiles(dir, out = []) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) listFiles(fullPath, out);
        else out.push(fullPath);
    }
    return out;
}

const distFiles = listFiles(distDir);
// Exact-case paths: Hosting is case-sensitive, the macOS filesystem is not.
const servedFiles = new Set(distFiles.map(f => "/" + path.relative(distDir, f).split(path.sep).join("/")));

/**
 * The URL Firebase Hosting serves a dist file at: `a/b/index.html` -> `/a/b/`.
 */
function pageUrl(htmlFile) {
    const rel = path.relative(distDir, htmlFile).split(path.sep).join("/");
    if (rel === "index.html") return "/";
    if (rel.endsWith("/index.html")) return "/" + rel.slice(0, -"index.html".length);
    return "/" + rel;
}

function loadRedirectSources() {
    const firebaseConfig = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../firebase.json"), "utf-8"));
    const hosting = Array.isArray(firebaseConfig.hosting) ? firebaseConfig.hosting[0] : firebaseConfig.hosting;
    return (hosting.redirects ?? []).map(r => r.source.replace(/\{,\/\}$/, "").replace(/\/$/, ""));
}

const redirectSources = new Set(loadRedirectSources());

/**
 * Whether Hosting answers this path with a page: a file, a directory index
 * (with or without the trailing slash) or a configured redirect.
 */
function exists(urlPath) {
    let decoded;
    try {
        decoded = decodeURIComponent(urlPath);
    } catch {
        return false;
    }
    if (redirectSources.has(decoded.replace(/\/$/, ""))) return true;
    if (decoded.endsWith("/")) return servedFiles.has(decoded + "index.html");
    return servedFiles.has(decoded) || servedFiles.has(decoded + "/index.html");
}

const hrefPattern = /<a\b[^>]*?\shref="([^"]*)"|<link\b(?=[^>]*\shreflang=")[^>]*?\shref="([^"]*)"/g;
const broken = new Map(); // resolved path -> Set of pages linking to it
let checked = 0;

for (const htmlFile of distFiles.filter(f => f.endsWith(".html"))) {
    const page = pageUrl(htmlFile);
    const html = fs.readFileSync(htmlFile, "utf-8");
    for (const match of html.matchAll(hrefPattern)) {
        // Starlight's 404 page declares /de/404/ etc. as alternates; it is served with a 404
        // status, so neither Google nor the redirect ever follows them.
        if (match[2] !== undefined && page === "/404.html") continue;
        const href = (match[1] ?? match[2]).replace(/&amp;/g, "&").trim();
        if (!href || href.startsWith("#") || /^(mailto|tel|javascript|data):/i.test(href)) continue;
        let resolved;
        try {
            resolved = new URL(href, siteOrigin + page);
        } catch {
            continue;
        }
        if (resolved.origin !== siteOrigin) continue;
        checked++;
        if (!exists(resolved.pathname)) {
            if (!broken.has(resolved.pathname)) broken.set(resolved.pathname, new Set());
            broken.get(resolved.pathname).add(`${page}  (href="${href}")`);
        }
    }
}

const brokenLinkCount = [...broken.values()].reduce((sum, pages) => sum + pages.size, 0);
for (const [target, pages] of [...broken.entries()].sort()) {
    console.log(`✗ ${target}`);
    for (const p of [...pages].slice(0, 5)) console.log(`    from ${p}`);
    if (pages.size > 5) console.log(`    … and ${pages.size - 5} more pages`);
}
console.log(`Checked ${checked} internal links: ${broken.size} missing targets, linked from ${brokenLinkCount} places.`);
process.exitCode = broken.size > 0 ? 1 : 0;
