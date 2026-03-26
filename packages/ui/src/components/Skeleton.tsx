import React from "react";
import { cls } from "../util";
import { useInjectStyles } from "../hooks";

export type SkeletonProps = {
    width?: number;
    height?: number;
    className?: string;
}

const styles = `
@keyframes shimmer {
  0% {
    transform: translateX(-150%);
  }
  100% {
    transform: translateX(150%);
  }
}
`;

export function Skeleton({
                             width,
                             height,
                             className
                         }: SkeletonProps) {
    
    useInjectStyles("Skeleton", styles);

    return <span
        style={{
            width: width ? `${width}px` : "100%",
            height: height ? `${height}px` : "12px"
        }}
        className={
        cls(
            "block relative overflow-hidden",
            "bg-surface-accent-200 dark:bg-surface-accent-800 rounded-md",
            "max-w-full max-h-full",
            className)
    }>
        <span 
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 dark:via-white/5 to-transparent" 
            style={{ animation: "shimmer 1s infinite" }}
        />
    </span>;
}
