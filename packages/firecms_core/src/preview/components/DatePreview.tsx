import React from "react";

import format from "date-fns/format";
import * as locales from "date-fns/locale";
import { FireCMSContext } from "../../types";
import { useFireCMSContext } from "../../hooks";
import { defaultDateFormat } from "../../util";

/**
 * @category Preview components
 */
export function DatePreview({
                                date
                            }: { date: Date }): React.ReactElement {

    const appConfig: FireCMSContext<any> | undefined = useFireCMSContext();
    // @ts-ignore
    const dateUtilsLocale = appConfig?.locale ? locales[appConfig?.locale] : undefined;
    const dateFormat: string = appConfig?.dateTimeFormat ?? defaultDateFormat;
    const formattedDate = date ? format(date, dateFormat, { locale: dateUtilsLocale }) : "";

    return (
        <>
            {formattedDate}
        </>
    );
}
