import React, { ErrorInfo, PropsWithChildren } from "react";
import { useTranslation } from "../hooks/useTranslation";

import { ErrorIcon, Typography } from "@firecms/ui";

export class ErrorBoundary extends React.Component<PropsWithChildren<Record<string, unknown>>, {
    hasError: boolean,
    error?: Error
}> {
    constructor(props: any) {
        super(props);
        this.state = { hasError: false };
    }

    // eslint-disable-next-line n/handle-callback-err
    static getDerivedStateFromError(error: Error) {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error(error);
        // logErrorToMyService(error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            // You can render any custom fallback UI
            return <FallbackView message={this.state.error?.message}/>;
        }

        return this.props.children;
    }
}

function FallbackView({ message }: { message?: string }) {
    const { t } = useTranslation();
    return (
        <div className="h-full w-full bg-slate-100 dark:bg-surface-900 flex items-center justify-center p-4">
            <div
                className="flex flex-col items-center justify-center m-4 bg-white dark:bg-surface-800 p-8 rounded-lg shadow-sm border border-gray-200 dark:border-surface-700">
                <div className="flex items-center mb-4 text-red-500 dark:text-red-400">
                    <ErrorIcon/>
                    <div className="ml-4">{t("error")}</div>
                </div>
                <div className="flex justify-center text-gray-500 dark:text-gray-400">
                    {/* Error message is purposely removed since it's hard to access state here, but typical ErrorBoundary fallback doesn't always show the raw message */}
                    {t("see_console_details")}
                </div>
            </div>
        </div>
    );
}
