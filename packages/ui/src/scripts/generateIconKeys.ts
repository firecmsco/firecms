import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const extractIconKeys = (cssData: string): string[] => {
    const iconKeys: string[] = [];
    const regex = /"(.*?)"/g;
    let match;

    while ((match = regex.exec(cssData)) !== null) {
        if (match[1]) {
            iconKeys.push(match[1].replaceAll("-", "_"));
        }
    }

    return iconKeys;
};

// export async function generateIconKeys() {
//     const cssData = await fs.promises.readFile("../../node_modules/@material-symbols/font-400/index.d.ts", "utf-8");
//     const keys = extractIconKeys(cssData);
//     saveIconKeys(keys);
//     return keys;
// }
export async function generateIconKeys() {
    // fetch from https://raw.githubusercontent.com/google/material-design-icons/refs/heads/master/font/MaterialIconsRound-Regular.codepoints
    const file = await fetch("https://raw.githubusercontent.com/google/material-design-icons/refs/heads/master/font/MaterialIconsRound-Regular.codepoints");
    const data = await file.text();
    const keys = data.split("\n").map((line) => line.split(" ")[0]);
    saveIconKeys(keys);
    return keys;
}

function saveIconKeys(keys: string[]) {
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    fs.writeFileSync(path.join(__dirname, "../icons/icon_keys.ts"), `export const iconKeys = ${JSON.stringify(keys, null, 4)};`);
}

generateIconKeys();
