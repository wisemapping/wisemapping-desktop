# WiseMapping Desktop - Setup Summary

## ✅ Project Status: Ready for Local Development

The WiseMapping Desktop application is fully configured and functional.

## 🚀 How to Run (Local Development)

Since version `6.0.1` of WiseMapping packages is not yet published to npm, we use a local setup script.

### 1. Requirements
- `wisemapping-frontend` repository must be in the parent directory (`../wisemapping-frontend`)
- Node.js >= 20.0.0
- Yarn

### 2. Setup

Run the setup command to build frontend packages and install them:

```bash
yarn deps
```

**⚠️ IMPORTANT:**
- **Do NOT run `yarn install` or `npm install` manually.**
- Running them will attempt to fetch `^6.0.1` from the registry and fail.
- **If you run `yarn add [package]`, you MUST run `yarn deps` afterwards** to restore the local packages.
- Always run `yarn deps` to refresh dependencies or update local packages.

### 3. Run the App

```bash
yarn dev
```

## 🏗️ Architecture & Configuration

### Package Management
- **Strategy**: Local tarball installation
- **Frontend**: Packages are built (`web2d`, `mindplot`, `editor`) and packed into `.tgz` files
- **Desktop**: Packages are installed via `npm install --no-save` to keep `package.json` clean
- **Dependency**: `package.json` references `^6.0.1` (future npm version)

### Fixes Applied
1. **Frontend Build**:
   - Compiles language files (`src/compiled-lang/*.json`) correctly
   - Bundles JSON files into the library output (`dist/editor.es.js`) avoiding runtime require errors
   - Correctly exports `editor.es.js` and `editor.umd.js`
2. **Desktop Setup**:
   - `scripts/setup-local.sh` automates the entire flow
   - Uses `npm` for installation to handle local tarballs correctly
   - Prevents `yarn` from complaining about missing registry versions

## 📦 Publishing to npm

Once WiseMapping `v6.0.1` is published to npm:
1. You can freely run `yarn install` (or `npm install`)
2. The `setup-local.sh` script becomes optional (only for testing unreleased changes)

## 📁 Key Files
- `package.json` - configuration and scripts
- `scripts/setup-local.sh` - magic script for local dev
- `src/main/main.ts` - Electron main process
- `src/renderer/` - React application

## Troubleshooting

**"Couldn't find any versions for @wisemapping/editor"**
- Cause: You ran `yarn install` manually.
- Fix: Run `yarn deps` again.

**"app is undefined" / Electron errors**
- Cause: Environment mismatch (rare)
- Fix: Ensure `yarn dev` is using the locally installed `electron` (it does by default).
