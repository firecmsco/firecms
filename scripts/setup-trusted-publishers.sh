#!/bin/bash

# Ensure we exit on error
set -e

# Verify npm version (requires 11.10.0+)
NPM_VER=$(npm --version)
IFS='.' read -r MAJOR MINOR PATCH <<< "$NPM_VER"
if [ "$MAJOR" -lt 11 ] || { [ "$MAJOR" -eq 11 ] && [ "$MINOR" -lt 10 ]; }; then
  echo "❌ Error: Your active npm version ($NPM_VER) is older than 11.10.0."
  echo "The 'npm trust' command is only supported on npm v11.10.0 and higher."
  echo ""
  echo "Please do one of the following to update your active environment:"
  echo "  1. Switch to Node 22+ (which includes npm 11+) using a version manager:"
  echo "     nvm use 22"
  echo "  2. Or update npm globally in your current terminal session:"
  echo "     npm install -g npm@latest"
  echo ""
  exit 1
fi

REPO="FireCMSco/firecms"
WORKFLOW_STABLE="publish.yml"
WORKFLOW_CANARY="publish-canary.yml"

echo "🔍 Finding publishable packages in the workspace..."
PACKAGES=$(node -e '
const fs = require("fs");
const path = require("path");
const find = (dir, depth) => {
  if (depth > 3) return [];
  let r = [];
  try {
    for (const f of fs.readdirSync(dir)) {
      if (["node_modules",".git","templates",".idea"].includes(f)) continue;
      const fp = path.join(dir, f);
      if (fs.statSync(fp).isDirectory()) r = r.concat(find(fp, depth+1));
      else if (f === "package.json") r.push(fp);
    }
  } catch(e) {}
  return r;
};
find("packages", 0).forEach(p => {
  try {
    const pkg = JSON.parse(fs.readFileSync(p, "utf-8"));
    if (pkg.name && !pkg.private) console.log(pkg.name);
  } catch(e) {}
});
')

if [ -z "$PACKAGES" ]; then
  echo "❌ No publishable packages found."
  exit 1
fi

echo "📦 Found publishable packages:"
for pkg in $PACKAGES; do
  echo "  - $pkg"
done
echo ""

echo "⚠️  Before running, make sure you:"
echo "   1. Are logged into npm locally (run 'npm login' if needed)"
echo "   2. Have 2FA enabled on npm"
echo "   3. Have npm v11.10.0 or higher installed (you have: $(npm --version))"
echo ""
echo "⚠️  During the loop, npm will prompt you for a 2FA code once."
echo "   Subsequent packages will reuse that session automatically."
echo ""
read -p "Proceed to configure Trusted Publishers for these packages? (y/N) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "Aborted."
  exit 1
fi

for pkg in $PACKAGES; do
  echo "------------------------------------------------------------"
  echo "🔐 Configuring OIDC trust for $pkg..."
  
  # Configure for stable releases
  echo "  🔹 Stable Release workflow ($WORKFLOW_STABLE)..."
  if ! npm trust github "$pkg" --file "$WORKFLOW_STABLE" --repo "$REPO" --allow-publish -y; then
    echo "     ⚠️  Command exited with an error. (If the error above was '409 Conflict', it is already configured.)"
  else
    echo "     ✅ Configured stable release workflow."
  fi
  
  # Configure for canary releases
  echo "  🔹 Canary Release workflow ($WORKFLOW_CANARY)..."
  if ! npm trust github "$pkg" --file "$WORKFLOW_CANARY" --repo "$REPO" --allow-publish -y; then
    echo "     ⚠️  Command exited with an error. (If the error above was '409 Conflict', it is already configured.)"
  else
    echo "     ✅ Configured canary release workflow."
  fi
done

echo ""
echo "✅ Success! All trusted publisher configurations have been set up on npmjs.com."
echo ""
echo "You can now remove the NPM_TOKEN secret from GitHub — publishing"
echo "will use GitHub Actions OIDC tokens automatically."
