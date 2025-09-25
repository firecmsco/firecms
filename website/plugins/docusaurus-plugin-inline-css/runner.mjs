// ESM runner for CSS inlining (no external deps)
import path from 'node:path';
import fs from 'node:fs/promises';
import process from 'node:process';

async function collectHtmlFiles(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) return collectHtmlFiles(fullPath);
      if (entry.isFile() && entry.name.endsWith('.html')) return [fullPath];
      return [];
    })
  );
  return files.flat();
}

function normalizeHrefToFsPath(outDir, htmlDir, href) {
  // Remove url params/hash
  const cleanHref = href.split('#')[0].split('?')[0];
  if (!cleanHref) return null;

  let resolved;
  if (cleanHref.startsWith('/')) {
    // Absolute from outDir root
    resolved = path.join(outDir, cleanHref.replace(/^\//, ''));
  } else {
    // Relative to html file directory
    resolved = path.resolve(htmlDir, cleanHref);
  }
  return resolved;
}

function shouldInlineLinkTag(linkTag) {
  // Only inline rel="stylesheet" links
  // Avoid preloads, alternate styles, or non-css hrefs
  const relMatch = /rel\s*=\s*(["'])?stylesheet\1?/i.test(linkTag);
  if (!relMatch) return false;
  const hrefMatch = linkTag.match(/href\s*=\s*("|')?([^"'>\s]+)\1?/i);
  if (!hrefMatch) return false;
  const href = hrefMatch[2];
  if (!/\.css($|[?#])/i.test(href)) return false;
  // Exclude external urls
  if (/^https?:\/\//i.test(href)) return false;
  return true;
}

function extractAttributes(linkTag) {
  const hrefMatch = linkTag.match(/href\s*=\s*("|')?([^"'>\s]+)\1?/i);
  const mediaMatch = linkTag.match(/media\s*=\s*("|')([^"']+)\1/i);
  return {
    href: hrefMatch ? hrefMatch[2] : null,
    media: mediaMatch ? mediaMatch[2] : null,
  };
}

function escapeStyleContent(css) {
  // Prevent accidental </style> termination
  return css.replace(/<\s*\/\s*style\s*>/gi, '<\\/style>');
}

async function inlineStylesInHtmlFile(outDir, htmlPath, cssCache) {
  const htmlDir = path.dirname(htmlPath);
  let html = await fs.readFile(htmlPath, 'utf8');

  const linkRegex = /<link\s+[^>]*>/gi; // we'll filter inside
  const linkTags = html.match(linkRegex) || [];
  if (!linkTags.length) return { changed: false, inlined: 0 };

  let inlinedCount = 0;
  for (const tag of linkTags) {
    if (!shouldInlineLinkTag(tag)) continue;
    const { href, media } = extractAttributes(tag);
    if (!href) continue;

    const cssFsPath = normalizeHrefToFsPath(outDir, htmlDir, href);
    if (!cssFsPath) continue;

    // Ensure target is within outDir to avoid escaping the build folder
    const relToOut = path.relative(outDir, cssFsPath);
    if (relToOut.startsWith('..') || (path.isAbsolute(relToOut) && !cssFsPath.startsWith(outDir))) {
      // Skip anything outside
      continue;
    }

    let css;
    try {
      if (cssCache.has(cssFsPath)) {
        css = cssCache.get(cssFsPath);
      } else {
        css = await fs.readFile(cssFsPath, 'utf8');
        cssCache.set(cssFsPath, css);
      }
    } catch (_e) {
      // File missing or unreadable; skip replacing this tag
      continue;
    }

    const styleAttrs = media ? ` media="${media}"` : '';
    const styleTag = `<style${styleAttrs}>\n${escapeStyleContent(css)}\n</style>`;

    // Replace only this specific tag occurrence (respecting potential duplicates)
    html = html.replace(tag, styleTag);
    inlinedCount += 1;
  }

  if (inlinedCount > 0) {
    await fs.writeFile(htmlPath, html, 'utf8');
    return { changed: true, inlined: inlinedCount };
  }
  return { changed: false, inlined: 0 };
}

async function withConcurrency(items, limit, worker) {
  const results = new Array(items.length);
  let idx = 0;
  const runners = new Array(Math.min(limit, items.length)).fill(0).map(async () => {
    while (true) {
      const current = idx++;
      if (current >= items.length) return;
      results[current] = await worker(items[current], current);
    }
  });
  await Promise.all(runners);
  return results;
}

async function main() {
  const outDir = process.argv[2];
  if (!outDir) {
    console.warn('CSS Inline runner: outDir not provided');
    process.exit(0);
  }

  let htmlFiles;
  try {
    htmlFiles = await collectHtmlFiles(outDir);
  } catch (e) {
    console.warn(`CSS Inline runner: Failed to read outDir ${outDir}:`, e?.message || e);
    process.exit(0);
  }

  if (!htmlFiles.length) {
    console.warn('CSS Inline runner: No HTML files found to process.');
    process.exit(0);
  }

  const verbose = process.env.CSS_INLINE_LOG === '1' || process.env.CSS_INLINE_LOG === 'true';
  if (verbose) console.log(`CSS Inline runner: Processing ${htmlFiles.length} HTML files...`);

  const cssCache = new Map();
  let totalInlined = 0;
  let changedFiles = 0;

  const limit = Number(process.env.CSS_INLINE_CONCURRENCY || 8);

  await withConcurrency(htmlFiles, limit, async (htmlAbsPath) => {
    try {
      const { changed, inlined } = await inlineStylesInHtmlFile(outDir, htmlAbsPath, cssCache);
      if (changed) {
        changedFiles += 1;
        totalInlined += inlined;
        if (verbose) {
          const rel = path.relative(outDir, htmlAbsPath);
          console.log(`  ✔ ${rel}: inlined ${inlined} stylesheet${inlined === 1 ? '' : 's'}`);
        }
      }
    } catch (e) {
      const rel = path.relative(outDir, htmlAbsPath);
      console.warn(`  ✖ Failed to process ${rel}:`, e?.message || e);
    }
  });

  console.log(`CSS Inline runner: Done. Modified ${changedFiles} file(s), inlined ${totalInlined} stylesheet tag(s).`);
}

main().catch((e) => {
  console.warn('CSS Inline runner: Unexpected error:', e?.message || e);
  // do not fail the build, just exit 0 to continue
  process.exit(0);
});

