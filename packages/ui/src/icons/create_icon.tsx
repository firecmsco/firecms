import React from "react";
import { Icon, IconProps } from "./Icon";

/**
 * Build one of the generated icon components.
 *
 * There are ~2200 of these and they differ only in the ligature key they hand to
 * `Icon`. Written out as individual `forwardRef` bodies they compiled to ~200
 * bytes each — 445KB of the `@firecms/ui` bundle, more than half of it — because
 * the React Compiler gives every one its own memo cache. That cache never hits:
 * the props object is a fresh literal on each render, so the comparison always
 * fails and we paid for the slots anyway. Hence `use no memo`, which is a
 * correctness-neutral opt-out here rather than a trade-off.
 *
 * Sharing one implementation drops the per-icon cost to the factory call. The
 * call sites are annotated `@__PURE__`, so a consumer bundling from source still
 * tree-shakes away the icons it does not use — which the previous form, with its
 * `displayName` assignment as a separate statement, did not reliably allow.
 */
export function createIcon(iconKey: string) {
    const IconComponent = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
        // The directive belongs on the render function itself; on the factory it
        // is ignored, because the factory is not what the compiler compiles.
        "use no memo";
        return <Icon {...props} iconKey={iconKey} ref={ref}/>;
    });
    IconComponent.displayName = keyToComponentName(iconKey);
    return IconComponent;
}

/**
 * Local copy of `keyToIconComponent` from `../util`.
 *
 * Kept here rather than imported so this module depends on nothing outside the
 * icons folder — `../util` also carries the class-merging helpers, and a
 * consumer importing a single icon should not pull those in.
 *
 * Derived from the key rather than passed in by the generator so the component
 * name is not repeated as a second string literal beside the export name. It
 * reproduces the `displayName` the per-file components carried, including the
 * cases where the exported name differs from it (`AddChartIcon` is
 * `AddchartIcon`).
 */
function keyToComponentName(key: string) {
    return (/^\d/.test(key) ? "_" : "") +
        key.split("_").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join("") +
        "Icon";
}
