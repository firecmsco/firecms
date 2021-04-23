import { PreviewComponentProps } from "../../preview";
import React from "react";

import { CMSAppProps } from "../../CMSAppProps";
import { useCMSAppContext } from "../../contexts";

import format from "date-fns/format";
import * as locales from "date-fns/locale";
import { defaultDateFormat } from "../../util/dates";
import { CMSAppContext } from "../../contexts/CMSAppContext";

export function TimestampPreview({
                                     name,
                                     value,
                                     property,
                                     size
                                 }: PreviewComponentProps<Date>): React.ReactElement {


    const appConfig: CMSAppContext | undefined = useCMSAppContext();
    const dateUtilsLocale = appConfig?.cmsAppConfig.locale ? locales[appConfig?.cmsAppConfig.locale] : undefined;
    const dateFormat: string = appConfig?.cmsAppConfig?.dateTimeFormat ?? defaultDateFormat;
    const formattedDate = value ? format(value, dateFormat, { locale: dateUtilsLocale }) : "";

    return (
        <>
            {formattedDate}
        </>
    );
}
