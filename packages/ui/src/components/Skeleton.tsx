import React from "react";
import { cls } from "../util";

export type SkeletonProps = {
    width?: number;
    height?: number;
    className?: string;
}

export function Skeleton({
                             width,
                             height,
                             className
                         }: SkeletonProps) {
    return <span
        style={{
            width: width ? `${width}px` : "100%",
            height: height ? `${height}px` : "12px"
        }}
        className={
        cls(
            "block",
            "bg-slate-200 dark:bg-slate-800 rounded",
            "animate-pulse",
            "max-w-full max-h-full",
            className)
    }/>;
}
