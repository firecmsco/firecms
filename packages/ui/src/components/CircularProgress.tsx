import React from "react";
import { cls } from "../util";

export type CircularProgressProps = {
    size?: "smallest" | "small" | "medium" | "large",
    className?: string
}

export function CircularProgress({
                                     size = "medium",
                                     className
                                 }: CircularProgressProps) {

    let sizeClasses = "";
    if (size === "smallest") {
        sizeClasses = "w-4 h-4";
    } else if (size === "small") {
        sizeClasses = "w-6 h-6";
    } else if (size === "medium") {
        sizeClasses = "w-8 h-8 m-1";
    } else {
        sizeClasses = "w-10 h-10 m-1";
    }

    let borderClasses = "";
    if (size === "smallest") {
        borderClasses = "border-[3px]";
    } else if (size === "small") {
        borderClasses = "border-[4px]";
    } else if (size === "medium") {
        borderClasses = "border-4";
    } else {
        borderClasses = "border-[6px]";
    }

    return (
        <div
            className={cls(
                sizeClasses,
                borderClasses,
                "inline-block animate-spin rounded-full border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]",
                "text-primary dark:text-primary",
                className)}
            role="status">
              <span
                  className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]"
              >
                  Loading...
              </span>
        </div>
    );
}
