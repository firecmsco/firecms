export function getIconKeys() {
    fetch("https://raw.githubusercontent.com/google/material-design-icons/master/variablefont/MaterialSymbolsRounded%5BFILL%2CGRAD%2Copsz%2Cwght%5D.codepoints")
        .then((response) => response.text())
        .then((text) => {
            const lines = text.split("\n");
            const words = lines.map((line) => line.split(" ")[0]);
            const keys = words.filter(Boolean);
            console.log(keys);
            return keys;
        });
}

getIconKeys();
