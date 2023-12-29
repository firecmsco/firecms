import * as React from "react";
import { cn } from "../utils";

export interface AlertProps {
    children: React.ReactNode;
    onDismiss?: () => void;
    color?: "error" | "warning" | "info" | "success";
    action?: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
}

const getClasses = (severity: string) => {
    switch (severity) {
        case "error":
            return "bg-red-50 dark:bg-red-800 dark:text-red-100 text-red-900";
        case "warning":
            return "bg-amber-50 dark:bg-amber-800 dark:text-amber-100 text-amber-900";
        case "info":
            return "bg-blue-50 dark:bg-blue-800 dark:text-blue-100 text-blue-900";
        case "success":
            return "bg-emerald-50 dark:bg-emerald-800 dark:text-emerald-100 text-emerald-900";
        default:
            return "bg-blue-50 dark:bg-blue-800 dark:text-blue-100 text-blue-900";
    }
};

export const Alert: React.FC<AlertProps> = ({
                                                children,
                                                onDismiss,
                                                color = "info",
                                                action,
                                                className,
                                                style
                                            }) => {
    const classes = getClasses(color);

    return (
        <div
            style={style}
            className={cn("px-4 py-2 rounded-md flex items-center gap-2", classes, className)}
        >
            <span className={"flex-grow"}>{children}</span>
            {onDismiss && (
                <button className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-400"
                        onClick={onDismiss}>
                    &times;
                </button>
            )}
            {action}
        </div>
    );
};
