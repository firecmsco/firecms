import { PreviewComponentProps } from "../../preview";
import React from "react";

import { CMSAppProps } from "../../CMSAppProps";
import { useAppConfigContext } from "../../contexts";

import format from "date-fns/format";
import * as locales from "date-fns/locale";
import { defaultDateFormat } from "../../util/dates";

export function TimestampPreview({
                                     name,
                                     value,
                                     property,
                                     size
                                 }: PreviewComponentProps<Date>): React.ReactElement {


    const appConfig: CMSAppProps | undefined = useAppConfigContext();
    const dateUtilsLocale = appConfig.locale ? locales[appConfig.locale] : undefined;
    const dateFormat: string = appConfig?.dateTimeFormat ?? defaultDateFormat;
    const formattedDate = value ? format(value, dateFormat, { locale: dateUtilsLocale }) : "";

    return (
        <>
            {formattedDate}
        </>
    );
}
