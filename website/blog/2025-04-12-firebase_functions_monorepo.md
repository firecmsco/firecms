---
slug: firebase_functions_monorepo
title: Firebase Functions Monorepo Deployments That Work
authors: francesco
---

![Fire](../static/img/blog/ai5J1ncw3p0.webp)

Monorepos bring huge advantages for code sharing and consistency, but deploying Firebase Functions from them often leads
to `E404 Not Found` errors or `TS6059` TypeScript issues. This occurs because Firebase's isolated build environment
doesn't understand local workspace packages or `paths` aliases.

After navigating the challenges, a robust solution emerged: **packing the shared package into a `.tgz` tarball and using
an automated script (`predeploy.js`)** to manage its inclusion during the deployment process. This guide details this
specific, working workflow based on a real-world setup.

## The Core Problem Recap

Firebase Functions deployment typically involves:

1. Uploading only the specified `functions` directory.
2. Running `npm install` or `npm ci` based *only* on the `package.json` (and potentially `package-lock.json`) found
   *within* that uploaded directory.

This breaks when `npm` tries to find local workspace packages (like `@your-org/common`) because they aren't on the
public registry and the rest of the workspace isn't present. TypeScript `paths` pointing to local source can also cause
`TS6059` (rootDir) errors during builds.

## The Solution: Automated `.tgz` Packing

This method ensures the shared package is treated like a regular dependency *within* the deployment package itself:

<!-- truncate -->

1. **Build & Pack:** The shared `common` package is built (`tsc`) and then packed into a `.tgz` file (`npm pack`).
2. **Automate (`predeploy.js`):** A script run before deployment handles:
    * Building and packing the `common` package.
    * Copying the generated `.tgz` into a specific folder within the `functions` directory (e.g., `local_deps`).
    * **Crucially:** Modifying `functions/package.json` to change the `@your-org/common` entry in `dependencies` to
      point directly to this copied `.tgz` file using the `file:` protocol (e.g.,
      `file:local_deps/your-org-common-1.0.0.tgz`).
3. **Deploy:** `firebase deploy` uploads the `functions` directory, now containing the `.tgz` file and the
   script-updated `package.json`.
4. **Install:** Firebase runs `npm install`, sees the `file:` path for `@your-org/common`, and installs it directly from
   the included `.tgz`, completely avoiding the public registry.

## Step-by-Step Implementation (Based on Working Config)

Here are the key configuration files from a setup confirmed to work, assuming a typical monorepo structure:

```text
my-monorepo/
├── packages/
│   ├── common/         # @your-org/common package
│   │   ├── src/
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── functions/      # Firebase Functions package
│       ├── src/
│       ├── predeploy.js  # Automation Script
│       ├── package.json
│       ├── tsconfig.json      # For IDE
│       └── tsconfig.build.json # For Build
├── package.json        # Workspace root
└── firebase.json
```

**1. Configure `common` Package (`packages/common`)**

* **`packages/common/package.json`:** Define how the package is built and what's included when packed.

    ```json
    {
      "name": "@your-org/common",
      "version": "1.0.0",
      "private": true,
      "main": "lib/index.js",
      "types": "lib/index.d.ts",
      "files": [
        "lib",
        "src"
      ],
      "scripts": {
        "build": "tsc",
        "dev": "tsc --watch"
      },
      "devDependencies": {
        "typescript": "^5.8.3"
      }
    }
    ```

* **`packages/common/tsconfig.json`:** Configure the TypeScript build for `common`. Ensure `declaration` is true and
  `composite` is false (or absent).

    ```json
    {
      "compilerOptions": {
        "declaration": true,
        "declarationMap": true,
        "rootDir": "src",
        "outDir": "lib",
        "module": "commonjs",
        "target": "es2018",
        "esModuleInterop": true,
        "strict": true,
        "skipLibCheck": true,
        "forceConsistentCasingInFileNames": true,
        "moduleResolution": "node"
      },
      "include": ["src/**/*"],
      "exclude": ["node_modules", "lib"]
    }
    ```

**2. Create Automation Script (`packages/functions/predeploy.js`)**

This Node.js script handles the prepare-pack-copy-update process.

```javascript
#!/usr/bin/env node
// packages/functions/predeploy.js
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('Starting transparent TGZ preparation...');

const functionsDir = path.resolve(__dirname);
const commonDir = path.resolve(functionsDir, '../common'); // Adjust if structure differs
const depsDir = path.join(functionsDir, 'local_deps');
const functionsPkgPath = path.join(functionsDir, 'package.json');
const lockfilePath = path.join(functionsDir, 'package-lock.json');

try {
    if (fs.existsSync(lockfilePath)) {
        console.log(`Deleting existing ${path.basename(lockfilePath)}...`);
        fs.unlinkSync(lockfilePath);
        console.log('Deleted lockfile.');
    }
} catch (err) { console.warn(`WARN: Could not delete ${path.basename(lockfilePath)}`, err); }

try {
    console.log(`Building common package in ${commonDir}...`);
    execSync('npm run build', { cwd: commonDir, stdio: 'inherit' });
    console.log('Common package built successfully.');

    console.log(`Packing common package in ${commonDir}...`);
    const tgzFilename = execSync('npm pack', { cwd: commonDir, encoding: 'utf-8' }).trim();
    if (!tgzFilename || !tgzFilename.endsWith('.tgz')) { throw new Error(`'npm pack' did not output a valid .tgz filename. Output: "${tgzFilename}"`); }
    const sourceTgzPath = path.join(commonDir, tgzFilename);
    console.log(`Packed successfully: ${tgzFilename}`);

    fs.mkdirSync(depsDir, { recursive: true });
    const targetTgzPath = path.join(depsDir, tgzFilename);

    console.log(`Copying ${tgzFilename} to ${depsDir}...`);
    fs.copyFileSync(sourceTgzPath, targetTgzPath);
    console.log('Copied successfully.');

    console.log(`Updating ${path.basename(functionsPkgPath)}...`);
    const pkgJson = JSON.parse(fs.readFileSync(functionsPkgPath, 'utf-8'));
    if (!pkgJson.dependencies) { pkgJson.dependencies = {}; }
    const relativeTgzPath = path.relative(functionsDir, targetTgzPath).replace(/\\/g, '/');
    pkgJson.dependencies['@your-org/common'] = `file:${relativeTgzPath}`; // Use placeholder name
    fs.writeFileSync(functionsPkgPath, JSON.stringify(pkgJson, null, 2) + '\n');
    console.log(`Updated @your-org/common dependency to: file:${relativeTgzPath}`);

    console.log('Transparent TGZ preparation complete.');

} catch (error) { console.error("\n❌ Error during transparent TGZ preparation:", error); process.exit(1); }
```

**3. Configure `functions` TypeScript (Two-File Setup)**

Use two files to separate IDE needs from build needs:

* **`packages/functions/tsconfig.json`:** (For IDE/Local Dev) - Includes `baseUrl` and `paths` for local development
  convenience.

    ```json
    // packages/functions/tsconfig.json
    {
      "compilerOptions": {
        "module": "commonjs",
        "noImplicitReturns": true,
        "esModuleInterop": true,
        "outDir": "lib",
        "sourceMap": true,
        "strict": true,
        "target": "es2018",
        "lib": ["esnext", "dom"],
        "skipLibCheck": true,
        "moduleResolution": "node",
        "declaration": true,
        "rootDir": "src",
        "baseUrl": ".",
        "paths": {
          "@your-org/common": ["../common/src"], // Use placeholder
          "@your-org/common/*": ["../common/src/*"]
        }
      },
      "include": ["src"],
      "exclude": ["node_modules", "lib", "local_deps"]
    }
    ```

* **`packages/functions/tsconfig.build.json`:** (For Build) - **Does not extend**. Manually lists required options, *
  *omitting `baseUrl` and `paths`**.

    ```json
    // packages/functions/tsconfig.build.json
    {
      "compilerOptions": {
        "module": "commonjs",
        "noImplicitReturns": true,
        "esModuleInterop": true,
        "outDir": "lib",
        "sourceMap": true, // Or false for production
        "strict": true,
        "target": "es2018",
        "lib": ["esnext", "dom"],
        "skipLibCheck": true,
        "moduleResolution": "node",
        "noFallthroughCasesInSwitch": true,
        "declaration": false, // Usually false for final app build
        "declarationMap": false,
        "rootDir": "src"
      },
      "include": ["src"],
      "exclude": [
        "node_modules",
        "lib",
        "local_deps",
        "**/*.spec.ts",
        "**/*.test.ts"
      ]
    }
    ```

**4. Configure `functions/package.json`**

Set up scripts and dependencies correctly. This reflects the working state where `@your-org/common` is only listed in
`dependencies`.

```json
// packages/functions/package.json
{
  "name": "your-functions-package", // Use placeholder name
  "scripts": {
    "lint": "eslint 'src/**/*'", // Adjust lint command as needed
    "build": "tsc -p tsconfig.build.json", // Use the build config
    "predeploy": "node predeploy.js", // Runs the automation script
    // Deploy: runs predeploy, then build, then firebase deploy
    // Use your preferred package manager runner (npm run, yarn, pnpm run)
    "deploy": "npm run predeploy && npm run build && firebase deploy --only functions --project=YOUR_FIREBASE_PROJECT_ID",
    "serve": "npm run build && firebase emulators:start --only functions" // Example serve
  },
  "engines": { "node": "20" },
  "main": "lib/index.js", // Point to compiled output
  "dependencies": {
    // NOTE: predeploy.js updates this value dynamically.
    // This shows the state *after* the script has run.
    "@your-org/common": "file:local_deps/your-org-common-1.0.0.tgz", // Placeholder path/filename

    // --- List true runtime dependencies from npm ---
    "firebase-admin": "^12.2.0",
    "firebase-functions": "^5.0.1"
    // ... other external packages like axios, pg, etc.
  },
  "devDependencies": {
    // NOTE: @your-org/common is OMITTED here per the provided working configuration.
    // Local IDE features may rely on the tsconfig.json paths alias.

    // --- List build tools, types etc. ---
    "typescript": "^5.8.3",
    "@types/node": "^20.0.0" // Match node engine
    // ... other dev dependencies (eslint, types, jest, yarpm, etc.)
  },
  "private": true
}
```

**5. Configure `firebase.json`**

Ensure the `predeploy` hook runs your automation script.

```json
// my-monorepo/firebase.json
{
  "functions": {
    "source": "packages/functions", // Path to your functions package
    "runtime": "nodejs20",
    "predeploy": [
      // Runs the 'predeploy' script from functions/package.json
      // Ensure this script name matches ("predeploy")
      "npm --prefix \"$RESOURCE_DIR\" run predeploy"
    ]
  },
  // ... other firebase config (hosting, etc.)
}
```

**Deployment Workflow Summary:**

1. Run `npm run deploy` (or your package manager equivalent) in `packages/functions`.
2. The `predeploy` script in `package.json` executes `node predeploy.js` via the `firebase.json` hook.
3. `predeploy.js` builds `common`, packs it, copies the `.tgz`, and updates `package.json` `dependencies`. It also
   deletes the lockfile found in the user's setup.
4. The `deploy` script in `package.json` continues, running `npm run build` (`tsc -p tsconfig.build.json`), compiling
   `functions` code using types resolved from `node_modules`.
5. The `deploy` script finishes by running `firebase deploy`.
6. Firebase CLI uploads the prepared `functions` directory.
7. Cloud Build runs `npm install`, installing `@your-org/common` from the included `file:local_deps/*.tgz`.
8. Deployment completes successfully.

This automated `.tgz` workflow provides a robust solution for deploying Firebase Functions from monorepos with shared
local packages, keeping both deployment and local development working effectively based on the configurations provided.
