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
            width: width !== undefined ? `${width}px` : undefined,
            height: height !== undefined ? `${height}px` : undefined
        }}
        className={
        cls(
            "block",
            "bg-surface-accent-200 dark:bg-surface-accent-800 rounded-md",
            "animate-pulse",
            "max-w-full max-h-full",
            width === undefined ? "w-full" : "",
            height === undefined ? "h-3" : "",
            className)
    }/>;
}
