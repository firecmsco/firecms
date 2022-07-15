import React from "react";

import format from "date-fns/format";
import * as locales from "date-fns/locale";
import { defaultDateFormat } from "../../core/util/dates";
import { FireCMSContext } from "../../models";
import { useFireCMSContext } from "../../hooks";

/**
 * @category Preview components
 */
export function DatePreview({
                                date
                            }: { date: Date }): React.ReactElement {

    const appConfig: FireCMSContext<any> | undefined = useFireCMSContext();
    const dateUtilsLocale = appConfig?.locale ? locales[appConfig?.locale] : undefined;
    const dateFormat: string = appConfig?.dateTimeFormat ?? defaultDateFormat;
    const formattedDate = date ? format(date, dateFormat, { locale: dateUtilsLocale }) : "";

    return (
        <>
            {formattedDate}
        </>
    );
}
