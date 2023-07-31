import { iconKeys } from "./icon_keys";
import fs from "fs";
import path from "path";

import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

fs.mkdirSync(path.join(__dirname, "../icons/components"), { recursive: true });

// create empty index file
fs.writeFileSync(path.join(__dirname, "../icons/index.ts"), "export * from \"./icon_keys\";\nexport * from \"./Icon\";\nexport * from \"./GitHubIcon\";\n");

// for each key, generate a file with an Icon ts component
iconKeys.forEach((key: string) => {

    const startsWithNumber = key.match(/^\d/);

    // convert key to came case
    const componentName = (startsWithNumber ? "_" : "") +
        key.split("_").map((word: string) => {
            return word.charAt(0).toUpperCase() + word.slice(1);
        }).join("") +
        "Icon";

    const iconComponent = `import { Icon, IconProps } from "../Icon";

export function ${componentName}(props: IconProps) {
    return <Icon {...props} iconKey={"${key}"}/>
}
`;

    const filePath = path.join(__dirname, `../icons/components/${componentName}.tsx`);
    fs.writeFileSync(filePath, iconComponent);

    // add export to index file
    fs.appendFileSync(path.join(__dirname, "../icons/index.ts"), `export * from "./components/${componentName}";\n`, { flag: "a" });
});

console.log("Generated icons successfully!");
