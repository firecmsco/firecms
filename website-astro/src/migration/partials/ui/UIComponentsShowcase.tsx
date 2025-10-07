import React, { Suspense } from "react";

const LazyClientUIComponentsShowcase = React.lazy(() => import("./ClientUIComponentsShowcase"));

export function UIComponentsShowcase() {

    return <Suspense fallback={<div style={{ height: 1600 }}/>}>
        <LazyClientUIComponentsShowcase/>
    </Suspense>;
}
