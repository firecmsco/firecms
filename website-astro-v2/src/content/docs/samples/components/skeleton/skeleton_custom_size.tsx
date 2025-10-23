import React from "react";
import { Skeleton } from "@firecms/ui";

export default function SkeletonCustomSizeDemo() {
    return (
        <>
            <Skeleton width={200} height={20} />
            <Skeleton width={100} height={10} />
        </>
    );
}