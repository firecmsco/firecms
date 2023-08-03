import { cn } from "./util/cn";

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
    return <span className={
        cn(
            "block",
            "bg-gray-200 dark:bg-gray-800 rounded",
            "animate-pulse",
            width ? `w-[${width}px]` : "w-full",
            height ? `h-[${height}px]` : "h-3",
            "max-w-full max-h-full",
            className)
    }/>;
}
