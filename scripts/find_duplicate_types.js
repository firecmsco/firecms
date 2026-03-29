const fs = require("fs");
const path = require("path");

const ROOT = "/Users/francesco/firecms_v4/packages";

const SKIP_DIRS = new Set(["node_modules", "dist", ".next", "build", "lib", "__tests__", "__mocks__", "coverage", ".yarn"]);

function walkDir(dir) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...walkDir(full));
    } else if (/\.(ts|tsx)$/.test(entry.name)) {
      // PERMANENT FIX: strictly exclude all .d.ts files (declaration maps) to avoid false positive duplicates
      if (entry.name.endsWith(".d.ts")) continue;
      
      results.push(full);
    }
  }
  return results;
}

// Regex to match exported type/interface/enum declarations
const DECL_RE = /^\s*export\s+(?:declare\s+)?(type|interface|enum)\s+([A-Z][A-Za-z0-9_]*)/;

const files = walkDir(ROOT);
const declarations = []; // { name, kind, file, line }

for (const filePath of files) {
  const content = fs.readFileSync(filePath, "utf-8");
  const lines = content.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(DECL_RE);
    if (m) {
      declarations.push({
        name: m[2],
        kind: m[1],
        file: path.relative(ROOT, filePath),
        line: i + 1,
      });
    }
  }
}

console.log(`Total exported type/interface/enum declarations found: ${declarations.length}\n`);

// Group by name
const byName = {};
for (const d of declarations) {
  if (!byName[d.name]) byName[d.name] = [];
  byName[d.name].push(d);
}

// Filter to names that appear in more than one DISTINCT file
const duplicates = {};
for (const [name, entries] of Object.entries(byName)) {
  const distinctFiles = new Set(entries.map((e) => e.file));
  if (distinctFiles.size > 1) {
    duplicates[name] = entries;
  }
}

const sortedDupes = Object.entries(duplicates).sort((a, b) => {
  const aFiles = new Set(a[1].map((e) => e.file)).size;
  const bFiles = new Set(b[1].map((e) => e.file)).size;
  return bFiles - aFiles;
});

console.log(`Types/interfaces/enums defined in multiple files: ${sortedDupes.length}\n`);

// Group by package for better categorization
function getPackage(filePath) {
  return filePath.split("/")[0];
}

console.log("=== DUPLICATES (defined in multiple distinct files) ===\n");

for (const [name, entries] of sortedDupes) {
  const distinctFiles = new Set(entries.map((e) => e.file));
  console.log(`--- ${name} (${distinctFiles.size} files) ---`);
  
  // Group entries by package
  const byPkg = {};
  for (const e of entries) {
    const pkg = getPackage(e.file);
    if (!byPkg[pkg]) byPkg[pkg] = [];
    byPkg[pkg].push(e);
  }
  
  for (const [pkg, pkgEntries] of Object.entries(byPkg)) {
    for (const e of pkgEntries) {
      console.log(`  [${e.kind}] ${e.file}:${e.line}`);
    }
  }
  console.log("");
}

// Also look for re-exports that might shadow types
console.log("=== POTENTIAL SHADOWING RE-EXPORTS ===\n");

const REEXPORT_RE = /^\s*export\s+(?:type\s+)?\{[^}]*\}\s+from\s+/;
const reexportCount = {};

for (const filePath of files) {
  const content = fs.readFileSync(filePath, "utf-8");
  const lines = content.split("\n");
  for (const line of lines) {
    if (REEXPORT_RE.test(line)) {
      // Extract names from { ... }
      const braceMatch = line.match(/\{([^}]+)\}/);
      if (braceMatch) {
        const names = braceMatch[1].split(",").map((n) => {
          // Handle "Foo as Bar" - use Bar (the exported name)
          const parts = n.trim().split(/\s+as\s+/);
          return parts[parts.length - 1].trim();
        }).filter(Boolean);
        
        for (const n of names) {
          if (/^[A-Z]/.test(n) && byName[n]) {
            // This type is both directly declared and re-exported
            if (!reexportCount[n]) reexportCount[n] = [];
            reexportCount[n].push(path.relative(ROOT, filePath));
          }
        }
      }
    }
  }
}

// Show types that are declared AND re-exported from different packages
let shadowCount = 0;
for (const [name, reexportFiles] of Object.entries(reexportCount)) {
  const declaredIn = new Set((byName[name] || []).map((e) => getPackage(e.file)));
  const reexportedIn = new Set(reexportFiles.map((f) => getPackage(f)));
  
  // Only interesting if re-exported from a different package than declared
  const crossPkgReexports = [...reexportedIn].filter((p) => !declaredIn.has(p));
  if (crossPkgReexports.length > 0) {
    shadowCount++;
    console.log(`--- ${name} ---`);
    console.log(`  Declared in: ${[...declaredIn].join(", ")}`);
    console.log(`  Re-exported from: ${crossPkgReexports.join(", ")}`);
    for (const f of reexportFiles) {
      if (crossPkgReexports.includes(getPackage(f))) {
        console.log(`    ${f}`);
      }
    }
    console.log("");
  }
}

if (shadowCount === 0) {
  console.log("  No cross-package shadowing re-exports found.\n");
}

console.log("=== END ===");
