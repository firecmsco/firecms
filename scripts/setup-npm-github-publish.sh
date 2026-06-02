#!/usr/bin/env bash
set -euo pipefail

#
# Setup script to enable GitHub Actions → npm publishing for @firecms packages.
# Replicates the approach used in the Rebase project.
#
# What this script does:
#   1. Verifies you're logged into npm with access to the @firecms scope
#   2. Verifies you're logged into gh CLI with access to FireCMSco/firecms
#   3. Creates an npm automation token (you'll need to enter your OTP)
#   4. Sets it as NODE_AUTH_TOKEN secret on the GitHub repo
#   5. Lists all publishable packages for verification
#

REPO="FireCMSco/firecms"
SECRET_NAME="NPM_TOKEN"

echo "============================================"
echo "  FireCMS: GitHub Actions → npm Publish Setup"
echo "============================================"
echo ""

# ── Step 1: Check npm auth ────────────────────────────────
echo "🔍 Step 1: Checking npm authentication..."
NPM_USER=$(npm whoami 2>/dev/null) || true
if [ -z "$NPM_USER" ]; then
  echo "❌ Not logged into npm. Logging in now..."
  npm login
  NPM_USER=$(npm whoami 2>/dev/null)
fi
echo "✅ Logged into npm as: $NPM_USER"
echo ""

# ── Step 2: Check gh auth ─────────────────────────────────
echo "🔍 Step 2: Checking GitHub CLI authentication..."
if ! gh auth status &>/dev/null; then
  echo "❌ Not logged into GitHub CLI. Logging in now..."
  gh auth login
fi
echo "✅ GitHub CLI authenticated"

# Verify repo access
if ! gh repo view "$REPO" --json name &>/dev/null; then
  echo "❌ Cannot access $REPO. Check your GitHub permissions."
  exit 1
fi
echo "✅ Can access $REPO"
echo ""

# ── Step 3: List publishable packages ─────────────────────
echo "📦 Step 3: Listing all publishable @firecms packages..."
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

PACKAGES=()
while IFS= read -r pkg_json; do
  PRIVATE=$(node -e "const p=require('$pkg_json'); console.log(p.private||false)" 2>/dev/null)
  if [ "$PRIVATE" = "false" ]; then
    PKG_NAME=$(node -e "const p=require('$pkg_json'); console.log(p.name)" 2>/dev/null)
    PACKAGES+=("$PKG_NAME")
  fi
done < <(find "$REPO_ROOT/packages" -maxdepth 2 -name "package.json" -not -path "*/node_modules/*" -not -path "*/templates/*")

echo "   Found ${#PACKAGES[@]} publishable packages:"
for pkg in "${PACKAGES[@]}"; do
  echo "     - $pkg"
done
echo ""

# ── Step 4: Create npm token ──────────────────────────────
echo "🔑 Step 4: Creating npm automation token..."
echo "   You may be prompted for your npm OTP (one-time password)."
echo ""

# Try to create an automation token
TOKEN=$(npm token create --read-only=false --cidr_whitelist="" 2>&1) || true

if echo "$TOKEN" | grep -q "token"; then
  # Extract the token value from the table output
  NPM_TOKEN=$(echo "$TOKEN" | grep "token" | head -1 | awk '{print $NF}')
  echo "✅ npm token created successfully"
else
  echo ""
  echo "⚠️  Could not create token automatically."
  echo "   Please create a token manually on https://www.npmjs.com/settings/tokens"
  echo ""
  echo "   Steps:"
  echo "     1. Go to https://www.npmjs.com → Access Tokens → Generate New Token"
  echo "     2. Select 'Granular Access Token'"
  echo "     3. Name: github-actions-firecms"
  echo "     4. Expiration: No expiration"  
  echo "     5. Packages: Select 'Only select packages and scopes' → @firecms"
  echo "     6. Permissions: Read and Write"
  echo "     7. Copy the token"
  echo ""
  read -rsp "   Paste your npm token here: " NPM_TOKEN
  echo ""
fi

if [ -z "$NPM_TOKEN" ]; then
  echo "❌ No token provided. Aborting."
  exit 1
fi

# Validate token works
echo "   Validating token..."
VALIDATE=$(NPM_TOKEN="$NPM_TOKEN" npm whoami --registry https://registry.npmjs.org 2>/dev/null) || true
if [ -n "$VALIDATE" ]; then
  echo "✅ Token validated (user: $VALIDATE)"
else
  echo "⚠️  Could not validate token, but proceeding anyway."
fi
echo ""

# ── Step 5: Set GitHub secret ─────────────────────────────
echo "🔒 Step 5: Setting $SECRET_NAME secret on $REPO..."
echo "$NPM_TOKEN" | gh secret set "$SECRET_NAME" --repo "$REPO"
echo "✅ Secret $SECRET_NAME set on $REPO"
echo ""

# ── Done ──────────────────────────────────────────────────
echo "============================================"
echo "  ✅ Setup Complete!"
echo "============================================"
echo ""
echo "  The GitHub Actions workflow can now publish"
echo "  ${#PACKAGES[@]} packages to npm."
echo ""
echo "  To trigger a publish, push to the 'canary' branch"
echo "  or create a version tag (v*)."
echo ""
echo "  Monitor at:"
echo "  https://github.com/$REPO/actions"
echo ""
