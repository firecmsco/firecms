import React from "react";

import { format } from "date-fns";
import * as locales from "date-fns/locale";
import { FireCMSContext } from "../../types";
import { useFireCMSContext } from "../../hooks";
import { defaultDateFormat } from "../../util";

/**
 * @group Preview components
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
