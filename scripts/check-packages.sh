#!/usr/bin/env bash
# ============================================================
# check-packages.sh — Systematic check for deps & build health
# Run from monorepo root:  ./scripts/check-packages.sh
# ============================================================

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'
ERROR_LOG=$(mktemp)

err()  { echo -e "${RED}✗ $1${NC}"; echo "1" >> "$ERROR_LOG"; }
ok()   { echo -e "${GREEN}✓ $1${NC}"; }
warn() { echo -e "${YELLOW}⚠ $1${NC}"; }
section() { echo -e "\n${YELLOW}━━━ $1 ━━━${NC}"; }
error_count() { wc -l < "$ERROR_LOG" | tr -d ' '; }

PACKAGES_DIR="$(cd "$(dirname "$0")/../packages" && pwd)"

# ──────────────────────────────────────────────────────────────
section "1. Stale path aliases (vite.config.ts / tsconfig.json)"
# ──────────────────────────────────────────────────────────────
PREV=$(error_count)
find "$PACKAGES_DIR" -maxdepth 2 \( -name "vite.config.ts" -o -name "tsconfig.json" -o -name "tsconfig.prod.json" \) -type f | while IFS= read -r file; do
    dir="$(dirname "$file")"
    pkg="$(basename "$dir")"
    fname="$(basename "$file")"
    grep -oE '"\.\./[a-zA-Z_-]+/src"' "$file" 2>/dev/null | tr -d '"' | while IFS= read -r relpath; do
        resolved="$(cd "$dir" && realpath -q "$relpath" 2>/dev/null || echo "")"
        if [ -z "$resolved" ] || [ ! -d "$resolved" ]; then
            err "$pkg/$fname → $relpath does not exist"
        fi
    done
done
if [ "$(error_count)" = "$PREV" ]; then
    ok "No stale path aliases found"
fi

# ──────────────────────────────────────────────────────────────
section "2. Missing @rebasepro/* deps in package.json"
# ──────────────────────────────────────────────────────────────
PREV=$(error_count)
for pkg_dir in "$PACKAGES_DIR"/*/; do
    pkg_name="$(basename "$pkg_dir")"
    src_dir="$pkg_dir/src"
    pkg_json="$pkg_dir/package.json"
    [ -d "$src_dir" ] || continue
    [ -f "$pkg_json" ] || continue

    # Collect unique @rebasepro/* imports from source (not from test files)
    imports=$(grep -rhoE 'from "@rebasepro/[a-zA-Z0-9_-]+"' "$src_dir" 2>/dev/null \
        | grep -v '.test.' | grep -v '.spec.' \
        | sed 's/from "//;s/"//' | sort -u || true)

    for imp in $imports; do
        # Skip self-references
        own_name=$(node -e "console.log(require('$pkg_json').name)" 2>/dev/null || true)
        [ "$imp" = "$own_name" ] && continue

        if ! grep -q "\"$imp\"" "$pkg_json" 2>/dev/null; then
            err "$pkg_name imports $imp but it's NOT in package.json"
        fi
    done
done
if [ "$(error_count)" = "$PREV" ]; then
    ok "All @rebasepro/* imports have matching package.json entries"
fi

# ──────────────────────────────────────────────────────────────
section "3. Stale types paths in package.json"
# ──────────────────────────────────────────────────────────────
PREV=$(error_count)
for pkg_dir in "$PACKAGES_DIR"/*/; do
    pkg_name="$(basename "$pkg_dir")"
    pkg_json="$pkg_dir/package.json"
    [ -f "$pkg_json" ] || continue

    types_path=$(node -e "
        const p = require('$pkg_json');
        const t = p.types || (p.exports && p.exports['.'] && p.exports['.'].types);
        if (t) console.log(t);
    " 2>/dev/null || true)

    if [ -n "$types_path" ]; then
        if echo "$types_path" | grep -qE '^\./dist/[^/]+/src/'; then
            dir_in_path=$(echo "$types_path" | sed -E 's|^\./dist/([^/]+)/src/.*|\1|')
            if [ "$dir_in_path" != "$pkg_name" ]; then
                err "$pkg_name: types path references '$dir_in_path' but package dir is '$pkg_name'"
            fi
        fi
    fi
done
if [ "$(error_count)" = "$PREV" ]; then
    ok "All types paths look correct"
fi

# ──────────────────────────────────────────────────────────────
section "4. Vite build check (server packages)"
# ──────────────────────────────────────────────────────────────
for pkg in server-core server-postgresql; do
    pkg_dir="$PACKAGES_DIR/$pkg"
    [ -d "$pkg_dir" ] || continue
    echo "  Building $pkg..."
    build_output=$( (cd "$pkg_dir" && npx vite build) 2>&1 ) || true
    if echo "$build_output" | grep -q "built in"; then
        size=$(echo "$build_output" | grep 'index.es.js' | head -1)
        ok "$pkg vite build succeeded — $size"
    else
        err "$pkg vite build FAILED"
        echo "$build_output" | tail -5
    fi
done

# ──────────────────────────────────────────────────────────────
section "5. ESM bundle health (no CJS globals in ES output)"
# ──────────────────────────────────────────────────────────────
PREV=$(error_count)
for pkg in server-core server-postgresql; do
    # Check all .js files in dist (main + chunks)
    for js_file in "$PACKAGES_DIR/$pkg/dist/"*.js; do
        [ -f "$js_file" ] || continue
        fname="$(basename "$js_file")"
        # Skip UMD (CJS globals are expected there)
        echo "$fname" | grep -q "umd" && continue

        if grep -qE '\b__filename\b|\b__dirname\b' "$js_file" 2>/dev/null; then
            offender=$(grep -oE '[a-zA-Z_-]+' <<< "$(grep -l '__filename\|__dirname' "$js_file")")
            err "$pkg/$fname contains __filename/__dirname (CJS globals crash in ESM)"
        fi
    done
done
if [ "$(error_count)" = "$PREV" ]; then
    ok "No CJS globals found in ES bundles"
fi

# ──────────────────────────────────────────────────────────────
section "6. Native/binary modules not inlined"
# ──────────────────────────────────────────────────────────────
PREV=$(error_count)
NATIVE_MODULES=("fsevents" "cpu-features" "bufferutil" "utf-8-validate")
for pkg in server-core server-postgresql; do
    for js_file in "$PACKAGES_DIR/$pkg/dist/index.es.js" "$PACKAGES_DIR/$pkg/dist/"index-*.js; do
        [ -f "$js_file" ] || continue
        fname="$(basename "$js_file")"
        for mod in "${NATIVE_MODULES[@]}"; do
            if grep -qE "(require|import).*['\"]$mod['\"]" "$js_file" 2>/dev/null; then
                err "$pkg/$fname inlines native module '$mod' — add to CONSUMER_EXTERNALS"
            fi
        done
    done
done
if [ "$(error_count)" = "$PREV" ]; then
    ok "No native modules inlined in bundles"
fi

# ──────────────────────────────────────────────────────────────
section "Summary"
# ──────────────────────────────────────────────────────────────
TOTAL=$(error_count)
if [ "$TOTAL" = "0" ]; then
    echo -e "\n${GREEN}All checks passed!${NC}"
    rm -f "$ERROR_LOG"
    exit 0
else
    echo -e "\n${RED}$TOTAL error(s) found.${NC}"
    rm -f "$ERROR_LOG"
    exit 1
fi
