import * as React from "react";
import { cn } from "../util";

export interface AlertProps {
    children: React.ReactNode;
    onDismiss?: () => void;
    color?: "error" | "warning" | "info" | "success" | "base";
    size?: "small" | "medium" | "large";
    action?: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
}

const getSizeClasses = (size: "small" | "medium" | "large") => {
    switch (size) {
        case "small":
            return "px-4 py-1";
        case "large":
            return "px-4 py-4";
        case "medium":
        default:
            return "px-4 py-2";
    }
}
const getColorClasses = (severity: string) => {
    switch (severity) {
        case "error":
            return "bg-red-50 dark:bg-red-800 dark:text-red-100 text-red-900";
        case "warning":
            return "bg-amber-50 dark:bg-amber-800 dark:text-amber-100 text-amber-900";
        case "info":
            return "bg-blue-50 dark:bg-blue-800 dark:text-blue-100 text-blue-900";
        case "success":
            return "bg-emerald-50 dark:bg-emerald-800 dark:text-emerald-100 text-emerald-900";
        case "base":
        default:
            return "bg-slate-50 dark:bg-slate-800 dark:text-slate-100 text-slate-900";
    }
};

export const Alert: React.FC<AlertProps> = ({
                                                children,
                                                onDismiss,
                                                color = "info",
                                                size = "medium",
                                                action,
                                                className,
                                                style
                                            }) => {
    const classes = getColorClasses(color);

    return (
        <div
            style={style}
            className={cn(
                getSizeClasses(size),
                "w-full",
                "rounded-md flex items-center gap-2",
                classes,
                className)}>
            <div className={"flex-grow"}>{children}</div>
            {onDismiss && (
                <button className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-400"
                        onClick={onDismiss}>
                    &times;
                </button>
            )}
            {action}
        </div>
    );
};
