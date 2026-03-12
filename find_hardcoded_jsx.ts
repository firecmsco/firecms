import * as fs from 'fs';
import * as path from 'path';
import * as ts from 'typescript';

function isAlphanumericAndSymbols(text: string) {
    // Basic filter: only care if it has some alphabetical characters.
    // We ignore things that are just punctuation or numbers (e.g., " | ", "-", "10")
    return /[a-zA-Z]/.test(text) && !/^\s*$/.test(text);
}

const ignoredStrings = new Set([
    'FireCMS', 'FireCMS Cloud', 'Google', 'Firebase', 'PostgreSQL', 'Cloud SQL',
    'Open in console', 't', 'button', 'div', 'span', 'p'
]);

function findHardcodedStrings(sourceFile: ts.SourceFile) {
    const results: { line: number, text: string }[] = [];

    function visit(node: ts.Node) {
        // Find raw JSX text nodes: <div>Some hardcoded text</div>
        if (ts.isJsxText(node)) {
            const text = node.getText();
            const trimmed = text.trim();
            if (isAlphanumericAndSymbols(trimmed) && !ignoredStrings.has(trimmed)) {
                // Ignore single word camelCase or PascalCase that might be components or variables
                if (!/^[a-zA-Z0-9_]+$/.test(trimmed) || trimmed.includes(" ") || trimmed.toLowerCase() !== trimmed) {
                     const { line } = sourceFile.getLineAndCharacterOfPosition(node.getStart());
                     results.push({ line: line + 1, text: trimmed });
                }
            }
        }

        // Find string literals inside JSX Expressions: <div>{"Some hardcoded text"}</div>
        if (ts.isJsxExpression(node) && node.expression && ts.isStringLiteral(node.expression)) {
            const text = node.expression.text;
            if (isAlphanumericAndSymbols(text) && !ignoredStrings.has(text)) {
                 const { line } = sourceFile.getLineAndCharacterOfPosition(node.getStart());
                 results.push({ line: line + 1, text: text });
            }
        }

        // Find string literals in certain props like `label`, `title`, `placeholder`, `description`, `tooltip`, `message`
        if (ts.isJsxAttribute(node)) {
            const name = node.name.getText();
            const allowedProps = ['label', 'title', 'placeholder', 'description', 'tooltip', 'message', 'subtitle', 'heading'];
            if (allowedProps.includes(name) && node.initializer) {
                if (ts.isStringLiteral(node.initializer)) {
                    const text = node.initializer.text;
                    if (isAlphanumericAndSymbols(text) && !ignoredStrings.has(text)) {
                        const { line } = sourceFile.getLineAndCharacterOfPosition(node.getStart());
                        results.push({ line: line + 1, text: `[Prop: ${name}] ${text}` });
                    }
                } else if (ts.isJsxExpression(node.initializer) && node.initializer.expression && ts.isStringLiteral(node.initializer.expression)) {
                    const text = node.initializer.expression.text;
                    if (isAlphanumericAndSymbols(text) && !ignoredStrings.has(text)) {
                        const { line } = sourceFile.getLineAndCharacterOfPosition(node.getStart());
                        results.push({ line: line + 1, text: `[Prop: ${name}] ${text}` });
                    }
                }
            }
        }

        ts.forEachChild(node, visit);
    }

    visit(sourceFile);
    return results;
}

const dirsToScan = process.argv.slice(2);
if (dirsToScan.length === 0) {
    console.error("Please provide directories to scan");
    process.exit(1);
}

const allResults: Record<string, any[]> = {};

function scanDir(dirPath: string) {
    const stat = fs.statSync(dirPath);
    if (!stat.isDirectory()) return;

    const files = fs.readdirSync(dirPath);
    for (const file of files) {
        const fullPath = path.join(dirPath, file);
        const fileStat = fs.statSync(fullPath);
        if (fileStat.isDirectory()) {
             if (!['node_modules', 'dist', 'build', '.git', '.next'].includes(file)) {
                 scanDir(fullPath);
             }
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) { 
             const content = fs.readFileSync(fullPath, 'utf8');
             const sourceFile = ts.createSourceFile(
                 fullPath,
                 content,
                 ts.ScriptTarget.Latest,
                 true,
                 ts.ScriptKind.TSX
             );
             const hardcoded = findHardcodedStrings(sourceFile);
             if (hardcoded.length > 0) {
                 allResults[fullPath.replace('/Users/francesco/firecms/', '')] = hardcoded;
             }
        }
    }
}

console.log("Scanning for hardcoded strings in JSX...");
for (const dir of dirsToScan) {
    scanDir(dir);
}

// Print results clearly
let total = 0;
for (const [file, items] of Object.entries(allResults)) {
    // Filter out test files and docs, templates, etc.
    if (file.includes('/test/') || file.includes('cli/templates/') || file.includes('website/') || file.includes('__tests__')) continue;
    
    // Some heuristics to filter false positives
    const filteredItems = items.filter(item => {
        // filter tiny strings
        if (item.text.length < 3) return false;
        // filter strings that are likely paths, urls, css paths, code keys
        if (item.text.includes('/') || item.text.startsWith('http') || item.text.startsWith('bg-') || item.text.startsWith('text-')) return false;
        if (/^[a-z_]+$/.test(item.text)) return false; // usually some internal key
        return true;
    });

    if (filteredItems.length === 0) continue;

    console.log(`\n\x1b[36m${file}\x1b[0m`);
    for (const item of filteredItems) {
        console.log(`  Line ${item.line}: \x1b[33m${item.text}\x1b[0m`);
        total++;
    }
}
console.log(`\nTotal potential hardcoded strings found: ${total}`);
