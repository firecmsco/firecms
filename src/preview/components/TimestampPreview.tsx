import { PreviewComponentProps } from "../../preview";
import React from "react";
import { useCMSAppContext } from "../../contexts";

import format from "date-fns/format";
import * as locales from "date-fns/locale";
import { defaultDateFormat } from "../../core/util/dates";
import { CMSAppContext } from "../../contexts/CMSAppContext";

/**
 * @category Preview components
 */
export default function TimestampPreview({
                                     name,
                                     value,
                                     property,
                                     size
                                 }: PreviewComponentProps<Date>): React.ReactElement {


    const appConfig: CMSAppContext | undefined = useCMSAppContext();
    const dateUtilsLocale = appConfig?.locale ? locales[appConfig?.locale] : undefined;
    const dateFormat: string = appConfig?.dateTimeFormat ?? defaultDateFormat;
    const formattedDate = value ? format(value, dateFormat, { locale: dateUtilsLocale }) : "";

    return (
        <>
            {formattedDate}
        </>
    );
}
