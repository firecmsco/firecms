import React from "react";
import { DateTimePicker } from "@material-ui/pickers";

import { FieldProps } from "../../models/form_props";

import { FieldDescription } from "../../components";
import { LabelWithIcon } from "../../components/LabelWithIcon";
import { useClearRestoreValue } from "../useClearRestoreValue";

type DateTimeFieldProps = FieldProps<Date>;

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
                InputProps={{ style: { padding: "4px" } }}
            />

            {includeDescription &&
            <FieldDescription property={property}/>}

        </React.Fragment>
    );
}
