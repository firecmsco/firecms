import * as React from "react";
import { cls } from "../util";

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
            return "bg-blue-100 dark:bg-blue-800 dark:text-blue-100 text-blue-900";
        case "success":
            return "bg-emerald-50 dark:bg-emerald-800 dark:text-emerald-100 text-emerald-900";
        case "base":
        default:
            return "bg-surface-accent-50 dark:bg-surface-accent-800 dark:text-white text-surface-accent-900";
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
            className={cls(
                getSizeClasses(size),
                "w-full",
                "font-medium",
                "rounded-md flex items-center gap-2",
                classes,
                className)}>
            <div className={"grow"}>{children}</div>
            {onDismiss && (
                <button className="text-surface-accent-400 hover:text-surface-accent-600 dark:text-surface-accent-500 dark:hover:text-surface-accent-400"
                        onClick={onDismiss}>
                    &times;
                </button>
            )}
            {action}
        </div>
    );
};
