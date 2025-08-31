import React from "react";

import { format } from "date-fns";
import * as locales from "date-fns/locale";
import { useCustomizationController } from "../../hooks";
import { defaultDateFormat } from "@firecms/common";

/**
 * @group Preview components
 */
export function DatePreview({
                                date
                            }: { date: Date }): React.ReactElement {

    const customizationController = useCustomizationController();
    // @ts-ignore
    const dateUtilsLocale = customizationController?.locale ? locales[customizationController?.locale] : undefined;
    const dateFormat: string = customizationController?.dateTimeFormat ?? defaultDateFormat;
    const formattedDate = date ? format(date, dateFormat, { locale: dateUtilsLocale }) : "";

    return (
        <>
            {formattedDate}
        </>
    );
}
