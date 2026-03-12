import React from "react";
import { Typography, IconButton, RefreshIcon, Button, Tooltip } from "@firecms/ui";
import { useTranslation } from "../../hooks";

export function CollectionDataErrorBanner({ error, onRetry }: { error?: Error, onRetry?: () => void }) {
    const { t } = useTranslation();
    if (!error) return null;

    const errorMessage = error.message || "";
    // Only extract standard Firestore index errors using the standard matching pattern
    const indexUrl = errorMessage.match(/https:\/\/console\.firebase\.google\.com[^\s]+/)?.[0];

    return (
        <div className="flex w-full items-center gap-4 px-4 py-3 bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800">
            <Typography variant="body2" className="text-red-700 dark:text-red-300 flex-1 break-words">
                <strong>{t("error")}:</strong>{" "}
                {indexUrl
                    ? t("error_firestore_index")
                    : errorMessage}
            </Typography>
            {onRetry && (
                <Tooltip title={t("refresh_data")}>
                    <IconButton
                        size="small"
                        onClick={onRetry}
                    >
                        <RefreshIcon size="small" />
                    </IconButton>
                </Tooltip>
            )}
            {indexUrl && (
                <Button
                    size="small"
                    variant="outlined"
                    color="error"
                    onClick={() => window.open(indexUrl, "_blank")}
                >
                    {t("create_index")}
                </Button>
            )}
        </div>
    );
}
