import React from "react";
import { Skeleton } from "@firecms/ui";

export default function SkeletonCustomDemo() {
    return (
        <>
            <Skeleton width={200} height={20} />
            <Skeleton width={100} height={50} className="mt-2" />
        </>
    );
}