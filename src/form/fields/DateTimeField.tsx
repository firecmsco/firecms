import React from "react";
import { DateTimePicker } from "@material-ui/pickers";

import { FieldProps } from "../../models";

import { FieldDescription } from "../../form/components";
import LabelWithIcon from "../components/LabelWithIcon";
import { useClearRestoreValue } from "../../hooks/useClearRestoreValue";
import { useCMSAppContext } from "../../contexts";
import { defaultDateFormat } from "../../util/dates";
import { CMSAppContext } from "../../contexts/CMSAppContext";

type DateTimeFieldProps = FieldProps<Date>;

/**
 * @category Form fields
 */
export default function DateTimeField({
                                          name,
                                          value,
                                          setValue,
                                          autoFocus,
                                          error,
                                          showError,
                                          disabled,
                                          touched,
                                          property,
                                          includeDescription,
                                          dependsOnOtherProperties
                                      }: DateTimeFieldProps) {


    const internalValue = value || null;

    const appConfig: CMSAppContext | undefined = useCMSAppContext();
    const dateFormat: string = appConfig?.cmsAppConfig?.dateTimeFormat ?? defaultDateFormat;

    useClearRestoreValue({
        property,
        value,
        setValue
    });

    return (
        <React.Fragment>

            <DateTimePicker
                fullWidth
                clearable
                autoFocus={autoFocus}
                value={internalValue}
                format={dateFormat}
                label={<LabelWithIcon scaledIcon={false} property={property}/>}
                error={showError}
                disabled={disabled}
                helperText={showError ? error : null}
                onChange={(dateValue) => {
                    return setValue(
                        dateValue
                    );
                }}
                inputVariant={"filled"}
            />

            {includeDescription &&
            <FieldDescription property={property}/>}

        </React.Fragment>
    );
}
