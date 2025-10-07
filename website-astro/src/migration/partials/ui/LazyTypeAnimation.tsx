import React, { Suspense } from "react";

const LazyTypeAnimationWrap = React.lazy(() => import("./TypeAnimationWrap"));

export function LazyTypeAnimation() {

    return   <Suspense fallback={<div style={{ height: 71 }}/>}>
        <LazyTypeAnimationWrap/>
    </Suspense>;
}
