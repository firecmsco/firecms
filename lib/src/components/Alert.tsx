import * as React from "react";

export interface AlertProps {
    children: React.ReactNode;
    onDismiss?: () => void;
    severity: "error" | "warning" | "info" | "success";
}

const getClasses = (severity: string) => {
    switch (severity) {
        case "error":
            return "bg-red-50 dark:bg-red-800 dark:text-red-200 text-red-900";
        case "warning":
            return "bg-amber-50 dark:bg-amber-800 dark:text-amber-200 text-amber-900";
        case "info":
            return "bg-blue-50 dark:bg-blue-800 dark:text-blue-200 text-blue-900";
        case "success":
            return "bg-emerald-50 dark:bg-emerald-800 dark:text-emerald-200 text-emerald-900";
        default:
            return "bg-blue-50 dark:bg-blue-800 dark:text-blue-200 text-blue-900";
    }
};

export const Alert: React.FC<AlertProps> = ({
                                                children,
                                                onDismiss,
                                                severity
                                            }) => {
    const classes = getClasses(severity);

    return (
        <div
            className={`p-4 rounded-md flex items-center space-x-4 ${classes}`}
        >
            <span className={`flex-grow`}>{children}</span>
            {onDismiss && (
                <button className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-400"
                        onClick={onDismiss}>
                    &times;
                </button>
            )}
        </div>
    );
};
