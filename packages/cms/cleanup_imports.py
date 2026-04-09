import os
import re

directory = "/Users/francesco/rebase/packages/cms/src"

files_updated = 0

for root, _, files in os.walk(directory):
    for file in files:
        if file.endswith(".ts") or file.endswith(".tsx"):
            filepath = os.path.join(root, file)
            with open(filepath, "r") as f:
                content = f.read()

            new_content = content
            # Replace relative imports going up directories
            new_content = re.sub(r'from ["\'](?:\.\./)+types/(collections|properties|controllers|index)["\']', r'from "@rebasepro/types"', new_content)
            # Replace relative imports same dir or one level down if they match exact names
            new_content = re.sub(r'from ["\']\./types/(collections|properties|controllers|index)["\']', r'from "@rebasepro/types"', new_content)

            # Also replace in types/index.ts
            if "types/index.ts" in filepath:
                # Remove export * from "./collections" etc
                new_content = re.sub(r'export \* from ["\']\./(collections|properties|controllers)["\'];\n', '', new_content)
                
            # For types/fields.tsx, it does import from "./collections" and "./properties"
            if "types/fields.tsx" in filepath:
                new_content = re.sub(r'from ["\']\./(collections|properties)["\']', r'from "@rebasepro/types"', new_content)

            if new_content != content:
                with open(filepath, "w") as f:
                    f.write(new_content)
                print(f"Updated {filepath}")
                files_updated += 1

print(f"Total files updated: {files_updated}")
