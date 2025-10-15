import React, { Suspense } from "react";
import { keyToIconComponent } from "@firecms/ui";
import SimpleCodeBlock from "../components/SimpleCodeBlock";

const LazySearchIconsView = React.lazy(() => import("./DefaultSearchIconsView"));

export function DocsIconsView() {
    const [selectedIcon, setSelectedIcon] = React.useState<string | undefined>(undefined);
    const componentName = selectedIcon ? keyToIconComponent(selectedIcon) : undefined;
    return <div className={"flex flex-col gap-4"}>
        <Suspense fallback={<div/>}>
            <LazySearchIconsView
                onIconSelected={setSelectedIcon}
            />

            {selectedIcon && <div className={"flex flex-col gap-4"}>
                <div>
                    If you need to specify your icon as a key, you can use the following value:
                </div>
                <b><code>{selectedIcon ?? "None"}</code></b>
                {componentName && <SimpleCodeBlock language={"tsx"} code={`import { ${componentName} } from "@firecms/ui";\n<${componentName}/>`} />}
            </div>}
        </Suspense>
    </div>;
}
