import clsx from "clsx";

export type SkeletonProps = {
    width?: number ;
    height?: number ;
}

export function Skeleton({
                             width,
                             height
                         }: SkeletonProps) {
    return <div className={
        clsx(
            "bg-gray-200 dark:bg-gray-800 rounded",
            "animate-pulse",
            width ? `w-[${width}px]` : "w-full",
            height ? `h-[${height}px]` : "h-3",
            "max-w-full max-h-full")
    }/>;
}
