import React, { Suspense } from "react";
import BrowserOnly from "@docusaurus/BrowserOnly";

const LazyClientUIComponentsShowcase = React.lazy(() => import("./ClientUIComponentsShowcase"));

export function UIComponentsShowcase() {

    return <BrowserOnly
        fallback={<div style={{ height: 1600 }}/>}>
        {() => (

            <Suspense fallback={<div style={{ height: 1600 }}/>}>
                <LazyClientUIComponentsShowcase/>
            </Suspense>
        )}
    </BrowserOnly>;
}
