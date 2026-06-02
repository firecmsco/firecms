#!/usr/bin/env bash
set -e

TEMPLATES=("community" "cloud" "next-pro" "astro")
FLAGS=("--community" "--cloud" "--next-pro" "--astro")

for i in "${!TEMPLATES[@]}"; do
  TEMPLATE="${TEMPLATES[$i]}"
  FLAG="${FLAGS[$i]}"
  FOLDER="test-$TEMPLATE"

  echo "============================================="
  echo "Testing Template: $TEMPLATE (Flag: $FLAG)"
  echo "============================================="

  # Clean up existing test folder if any
  if [ -d "$FOLDER" ]; then
    echo "Cleaning up existing folder: $FOLDER"
    rm -rf "$FOLDER"
  fi

  # Run init
  echo "Initializing $TEMPLATE..."
  ./run_init.exp "$FOLDER" "$FLAG"

  # Enter directory
  cd "$FOLDER"

  # Install packages
  echo "Installing dependencies..."
  npm install

  # Run audit
  echo "Auditing dependencies..."
  npm audit || {
    echo "Warning: npm audit found issues for template $TEMPLATE"
  }

  # Build project
  echo "Building project..."
  npm run build

  # Leave directory
  cd ..
  echo "Template $TEMPLATE tested successfully!"
  echo "============================================="
  echo ""
done
