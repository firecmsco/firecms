import React from "react";
import { DateTimePicker } from "@material-ui/pickers";

import { CMSFieldProps } from "../../models/form_props";

import { FieldDescription } from "../../components";
import { LabelWithIcon } from "../../components/LabelWithIcon";

type DateTimeFieldProps = CMSFieldProps<Date>;

export default function DateTimeField({
                                          name,
                                          value,
                                          setValue,
                                          autoFocus,
                                          error,
                                          showError,
                                          isSubmitting,
                                          touched,
                                          property,
                                          includeDescription
                                      }: DateTimeFieldProps) {


    const internalValue = value || null;

    const disabled = property.disabled !== undefined ? property.disabled : isSubmitting || !!property.autoValue;
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
