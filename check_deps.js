const fs = require('fs');
const path = require('path');
const glob = require('glob'); // wait, glob might not be installed in the root, I'll use fs

const packagesDir = path.join(__dirname, 'packages');
const packages = fs.readdirSync(packagesDir).filter(p => fs.statSync(path.join(packagesDir, p)).isDirectory());

const allRebasePackages = new Set();
const packageJsonData = {};
const viteConfigData = {};

let issues = [];

packages.forEach(pkg => {
    if (pkg === 'cli') return; // CLI has templates etc that might be complex, let's include it but ignore templates
    const pkgJsonPath = path.join(packagesDir, pkg, 'package.json');
    if (fs.existsSync(pkgJsonPath)) {
        const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'));
        allRebasePackages.add(pkgJson.name);
        packageJsonData[pkg] = pkgJson;
    }
});

packages.forEach(pkg => {
    if (pkg === 'cli') return;
    const pkgJson = packageJsonData[pkg];
    if (!pkgJson) return;

    const deps = { ...pkgJson.dependencies, ...pkgJson.devDependencies, ...pkgJson.peerDependencies };
    const rebaseDeps = Object.keys(deps).filter(d => d.startsWith('@rebasepro/'));
    
    const viteConfigPath = path.join(packagesDir, pkg, 'vite.config.ts');
    let hasViteConfig = false;
    let viteContent = '';
    if (fs.existsSync(viteConfigPath)) {
        hasViteConfig = true;
        viteContent = fs.readFileSync(viteConfigPath, 'utf8');
        viteConfigData[pkg] = viteContent;
    }

    // Usually, in Vite config for libraries, you define peerDependencies or all dependencies as external.
    // If they explicitly list @rebasepro/*, they must list what they actually depend on.
    
    if (hasViteConfig) {
        // Let's extract Rollup externals using regex
        const externalMatch = viteContent.match(/external:\s*\[(.*?)\]/s);
        if (externalMatch) {
            const externalStr = externalMatch[1];
            rebaseDeps.forEach(dep => {
                if (!externalStr.includes(`'${dep}'`) && !externalStr.includes(`"${dep}"`) && !externalStr.includes('...Object.keys(packageJson.peerDependencies') && !externalStr.includes('...Object.keys(packageJson.dependencies')) {
                     const isCaughtByRegex = viteContent.includes('/^@rebasepro\\/.*$/');
                     if(!isCaughtByRegex && !viteContent.includes(`...Object.keys(packageJson.peerDependencies || {})`)){
                         issues.push(`${pkg}: Dependency ${dep} is in package.json but might not be in external of vite.config.ts`);
                     }
                }
            });
        } else {
            issues.push(`${pkg}: vite.config.ts does not have an external array`);
        }
        
        // Also check if they declare "rebase" or "@rebasepro/*" in external, but it's not in package.json
        const rebaseExternalMatches = [...viteContent.matchAll(/['"](@rebasepro\/[a-zA-Z0-z-_]+)['"]/g)].map(m => m[1]);
        rebaseExternalMatches.forEach(dep => {
            if (!rebaseDeps.includes(dep)) {
                issues.push(`${pkg}: ${dep} is mentioned in vite.config.ts but NOT in package.json`);
            }
        });
    }
});

console.log(issues.join('\n'));
if (issues.length === 0) console.log("No issues found (script logic maybe too simple).");

