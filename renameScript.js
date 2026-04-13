const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const renames = [
  { f: "postgresql-backend", nf: "server-postgresql", op: "@rebasepro/postgresql-backend", np: "@rebasepro/server-postgresql" },
  { f: "backend", nf: "server-core", op: "@rebasepro/backend", np: "@rebasepro/server-core" },
  { f: "mongodb", nf: "server-mongodb", op: "@rebasepro/mongodb", np: "@rebasepro/server-mongodb" },
  { f: "mcp_server", nf: "mcp-server", op: "@rebasepro/mcp-server", np: "@rebasepro/mcp-server" },
  { f: "client-rebase", nf: "client", op: "@rebasepro/client-rebase", np: "@rebasepro/client" },
  { f: "postgresql", nf: "client-postgresql", op: "@rebasepro/postgresql", np: "@rebasepro/client-postgresql" },
  { f: "firebase", nf: "client-firebase", op: "@rebasepro/firebase", np: "@rebasepro/client-firebase" },
  { f: "auth-rebase", nf: "plugin-auth", op: "@rebasepro/auth-rebase", np: "@rebasepro/plugin-auth" },
  { f: "data_enhancement", nf: "plugin-enhancement", op: "@rebasepro/data_enhancement", np: "@rebasepro/plugin-enhancement" },
  { f: "schema_inference", nf: "plugin-schema", op: "@rebasepro/schema_inference", np: "@rebasepro/plugin-schema" },
  { f: "datatalk", nf: "plugin-datatalk", op: "@rebasepro/datatalk", np: "@rebasepro/plugin-datatalk" },
  { f: "sdk_generator", nf: "sdk-generator", op: "@rebasepro/sdk_generator", np: "@rebasepro/sdk-generator" }
];

console.log("Renaming folders...");
for (const r of renames) {
  const oldPath = path.join(__dirname, "packages", r.f);
  const newPath = path.join(__dirname, "packages", r.nf);
  if (fs.existsSync(oldPath) && oldPath !== newPath) {
    fs.renameSync(oldPath, newPath);
    console.log(`Renamed folder ${r.f} -> ${r.nf}`);
  }
}

// Ensure the replacement array is sorted by length descending to avoid substring replacement bugs
const replacements = [...renames].sort((a, b) => b.op.length - a.op.length);

function replaceInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;
    for (const r of replacements) {
      if (content.includes(r.op)) {
        // Use global RegExp for replacements
        content = content.replace(new RegExp(r.op.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), r.np);
        changed = true;
      }
    }
    if (changed) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated contents ${filePath}`);
    }
  } catch (err) {
    // Ignore binary/directory errors
  }
}

function traverse(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    if (file === "node_modules" || file === "dist" || file === ".git" || file === ".agent") continue;
    
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      traverse(fullPath);
    } else {
      if (fullPath.match(/\.(ts|tsx|js|jsx|json)$/)) {
        replaceInFile(fullPath);
      }
    }
  }
}

console.log("Replacing imports and package.json references...");
traverse(__dirname);

console.log("Done.");
