import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const extractIconKeys = (cssData: string): string[] => {
    const iconKeys: string[] = [];
    console.log("cssData", cssData);
    const regex = /\.mi-(.*?)::before/g;
    let match;

    while ((match = regex.exec(cssData)) !== null) {
        if (match[1]) {
            iconKeys.push(match[1].replaceAll("-", "_"));
        }
    }

    return iconKeys;
};

//https://github.com/google/material-design-icons/blob/master/variablefont/MaterialSymbolsRounded%5BFILL%2CGRAD%2Copsz%2Cwght%5D.codepoints
export async function generateIconKeys() {
    const cssData = await fs.promises.readFile("../../node_modules/material-icons/css/material-icons.css", 'utf-8');
    const keys = extractIconKeys(cssData);
    saveIconKeys(keys);
    return keys;
}

function saveIconKeys(keys: string[]) {
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    fs.writeFileSync(path.join(__dirname, "../icons/icon_keys.ts"), `export const iconKeys = ${JSON.stringify(keys, null, 4)};`);
}

generateIconKeys();
