import React from "react";

import { format } from "date-fns";
import { useCustomizationController } from "../../hooks";
import { defaultDateFormat, localeToLanguageTag, useDateFnsLocale } from "../../util";

export interface DatePreviewProps {
    date: Date;
    /**
     * Display mode: "date" for date-only, "date_time" for date and time
     */
    mode?: "date" | "date_time";
    /**
     * IANA timezone identifier (e.g., "America/New_York")
     * When specified, the date will be displayed in this timezone
     */
    timezone?: string;
}

/**
 * The locale is a date-fns key ("enUS", "ptBR"), which `Intl` refuses: it threw here,
 * and took the field down with it, for every region locale.
 */
function dateTimeFormat(locale: string | undefined, options: Intl.DateTimeFormatOptions): Intl.DateTimeFormat {
    try {
        return new Intl.DateTimeFormat(locale ? localeToLanguageTag(locale) : "en-US", options);
    } catch {
        return new Intl.DateTimeFormat("en-US", options);
    }
}

/**
 * @group Preview components
 */
export function DatePreview({
    date,
    mode = "date_time",
    timezone
}: DatePreviewProps): React.ReactElement {

    const customizationController = useCustomizationController();
    const dateUtilsLocale = useDateFnsLocale(customizationController?.locale);

    if (!date) {
        return <></>;
    }

    // If timezone is specified, format in that timezone using Intl.DateTimeFormat
    if (timezone) {
        const options: Intl.DateTimeFormatOptions = {
            year: "numeric",
            month: "short",
            day: "numeric",
            timeZone: timezone
        };

        if (mode === "date_time") {
            options.hour = "2-digit";
            options.minute = "2-digit";
        }

        const formatter = dateTimeFormat(customizationController?.locale, options);
        const formattedDate = formatter.format(date);

        // Get timezone abbreviation
        const tzFormatter = new Intl.DateTimeFormat("en-US", {
            timeZone: timezone,
            timeZoneName: "short"
        });
        const parts = tzFormatter.formatToParts(date);
        const tzAbbrev = parts.find(p => p.type === "timeZoneName")?.value ?? "";

        return (
            <span className="flex items-center gap-1">
                {formattedDate}
                {tzAbbrev && (
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                        ({tzAbbrev})
                    </span>
                )}
            </span>
        );
    }

    // No timezone specified: use local formatting with date-fns
    let dateFormat: string;
    if (mode === "date") {
        // Date-only format (no time)
        dateFormat = customizationController?.dateTimeFormat
            ? customizationController.dateTimeFormat.replace(/[, ]*[HhKk].*$/, "").trim()
            : "PP"; // e.g., "Apr 29, 2024"
    } else {
        // Full date-time format
        dateFormat = customizationController?.dateTimeFormat ?? defaultDateFormat;
    }

    const formattedDate = format(date, dateFormat, { locale: dateUtilsLocale });

    return (
        <>
            {formattedDate}
        </>
    );
}
