#!/bin/bash

# Setup script for local development with wisemapping-frontend
# Compiles, packs, and installs packages locally without modifying package.json

set -e

echo "🚀 Setting up WiseMapping Desktop with local frontend packages..."

# Check if wisemapping-frontend exists
if [ ! -d "../wisemapping-frontend" ]; then
    echo "❌ Error: wisemapping-frontend not found at ../wisemapping-frontend"
    echo "Please ensure wisemapping-frontend is in the parent directory"
    exit 1
fi

FRONTEND_DIR="$(cd ../wisemapping-frontend && pwd)"
DESKTOP_DIR="$(pwd)"

# 1. Compile wisemapping-frontend packages
echo "🔨 Compiling wisemapping-frontend packages..."
cd "$FRONTEND_DIR"
# Scope build to only what we need (skipping webapp)
yarn lerna run build --scope @wisemapping/editor --scope @wisemapping/mindplot --scope @wisemapping/web2d --include-dependencies

# 2. Pack packages
echo "📦 Packing packages..."
echo "  - web2d..."
cd "$FRONTEND_DIR/packages/web2d"
yarn pack --filename wisemapping-web2d.tgz
WEB2D_PACK="$(pwd)/wisemapping-web2d.tgz"

echo "  - mindplot..."
cd "$FRONTEND_DIR/packages/mindplot"
yarn pack --filename wisemapping-mindplot.tgz
MINDPLOT_PACK="$(pwd)/wisemapping-mindplot.tgz"

echo "  - editor..."
cd "$FRONTEND_DIR/packages/editor"
yarn pack --filename wisemapping-editor.tgz
EDITOR_PACK="$(pwd)/wisemapping-editor.tgz"

# 3. Install packages to wisemapping-desktop
echo "📥 Installing packages..."
cd "$DESKTOP_DIR"

# Explicitly remove package-lock to avoid conflicts if user ran npm before
rm -f package-lock.json

# Clean Vite cache to prevent stale dependency issues
rm -rf node_modules/.vite
echo "  - Cleared Vite cache"

# Use npm install for everything because Yarn 1.x cannot install local packages
# without adding them to package.json or failing on registry lookup.
# npm handles --no-save correctly.

echo "  - Installing dependencies from npm..."
# We use --legacy-peer-deps to avoid potential conflicts, just in case
npm install --no-save

echo "  - Installing local WiseMapping packages..."
# Install local packages without modifying package.json
npm install "$WEB2D_PACK" "$MINDPLOT_PACK" "$EDITOR_PACK" --no-save

echo "✅ Setup complete!"
echo ""
echo "⚠️  IMPORTANT FOR LOCAL DEVELOPMENT:"
echo "   Do NOT run 'yarn install' or 'npm install' manually."
echo "   Running them will try to find version 6.0.1 on the registry and FAIL."
echo "   Always run 'yarn deps' to refresh dependencies."
echo ""
echo "You can now run:"
echo "  yarn dev"
