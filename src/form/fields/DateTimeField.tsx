import React from "react";

import { TextField as MuiTextField } from "@material-ui/core";
import DateTimePicker from "@material-ui/lab/DateTimePicker";

import { FieldProps } from "../../models";

import { FieldDescription } from "../../form/components";
import LabelWithIcon from "../components/LabelWithIcon";
import { useClearRestoreValue } from "../../hooks/useClearRestoreValue";

type DateTimeFieldProps = FieldProps<Date>;

/**
 * Field that allows selecting a date
 *
 * This is one of the internal components that get mapped natively inside forms
 * and tables to the specified properties.
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

    useClearRestoreValue({
        property,
        value,
        setValue
    });

    return (
        <React.Fragment>

            <DateTimePicker
                clearable
                autoFocus={autoFocus}
                value={internalValue}
                label={<LabelWithIcon scaledIcon={false} property={property}/>}
                renderInput={(props) => (
                    <MuiTextField {...props}
                                  fullWidth
                                  error={showError}
                                  // format={dateFormat}
                                  variant={"filled"}
                                  helperText={showError ? error : null}/>
                )}
                disabled={disabled}
                onChange={(dateValue) => {
                    return setValue(
                        dateValue
                    );
                }}
            />

            {includeDescription &&
            <FieldDescription property={property}/>}

        </React.Fragment>
    );
}
