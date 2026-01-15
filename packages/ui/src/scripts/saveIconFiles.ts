// const fs = require("fs");
// const path = require("path");
// const { fileURLToPath } = require("url");
// const { iconKeys } = require("..");

import fs from "fs";
import path from "path";

import { fileURLToPath } from "url";
import { keyToIconComponent } from "../util/key_to_icon_component.ts";

// import { iconKeys } from "../icons/icon_keys.ts";


export function saveIconFiles(iconKeys: string[]) {
    const __dirname = path.dirname(fileURLToPath(import.meta.url));

    fs.mkdirSync(path.join(__dirname, "../icons/components"), { recursive: true });

// create empty index file
    fs.writeFileSync(path.join(__dirname, "../icons/index.ts"), "export * from \"./icon_keys\";\nexport * from \"./cool_icon_keys\";\nexport * from \"./Icon\";\nexport * from \"./GitHubIcon\";\nexport * from \"./HandleIcon\";\n");

    const generatedComponents = new Set<string>();

// for each key, generate a file with an Icon ts component
    iconKeys.forEach((key: string) => {
        if (!key) return;
        const componentName = keyToIconComponent(key);

        if (componentName === "Icon") {
            console.log("Skipping Icon component generation to avoid conflict");
            return;
        }

        if (generatedComponents.has(componentName.toLowerCase())) {
            console.log(`Skipping duplicate component ${componentName} for key ${key}`);
            return;
        }
        generatedComponents.add(componentName.toLowerCase());

        const iconComponent = `import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const ${componentName} = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"${key}"} ref={ref}/>
});

${componentName}.displayName = "${componentName}";
`;

        const filePath = path.join(__dirname, `../icons/components/${componentName}.tsx`);
        console.log(`Saving icon component to ${filePath}`);
        fs.writeFileSync(filePath, iconComponent);

        // add export to index file
        fs.appendFileSync(path.join(__dirname, "../icons/index.ts"), `export * from "./components/${componentName}";\n`, { flag: "a" });
    });
}


