
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

//https://github.com/google/material-design-icons/blob/master/variablefont/MaterialSymbolsRounded%5BFILL%2CGRAD%2Copsz%2Cwght%5D.codepoints
export function generateIconKeys() {
    return fetch("https://raw.githubusercontent.com/google/material-design-icons/master/variablefont/MaterialSymbolsRounded%5BFILL%2CGRAD%2Copsz%2Cwght%5D.codepoints")
        .then((response) => response.text())
        .then((text) => {
            const lines = text.split("\n");
            const words = lines.map((line) => line.split(" ")[0]);
            const keys = words.filter(Boolean).filter((word) => word !== "addchart");
            console.log(keys);
            saveIconKeys(keys);
            return keys;
        });
}

function saveIconKeys(keys: string[]) {
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    fs.writeFileSync(path.join(__dirname, "../icons/icon_keys.ts"), `export const iconKeys = ${JSON.stringify(keys, null, 4)};`);
}

generateIconKeys();
