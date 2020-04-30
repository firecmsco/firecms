import { ArrayProperty, EnumType, EnumValues } from "../../models";
import { Field, getIn } from "formik";
import {
    Checkbox,
    FormControl,
    FormHelperText,
    InputLabel,
    ListItemText,
    MenuItem,
    Select as MuiSelect
} from "@material-ui/core";
import { renderPreviewEnumChip } from "../../preview";
import React from "react";
import { CMSFieldProps } from "./CMSFieldProps";

interface ArrayEnumSelectProps<T extends EnumType> extends CMSFieldProps<any[],ArrayProperty<T>>{
}

export default function ArrayEnumSelect<T extends EnumType>({ name,  property,  value }: ArrayEnumSelectProps<T>) {

    if (property.of.dataType !== "string" && property.of.dataType !== "number") {
        throw Error("Field misconfigured: array field of type string or number");
    }

    const enumValues: EnumValues<number | string> | undefined = property.of.enumValues;
    if (!enumValues) {
        console.error(property);
        throw Error("Field misconfigured: array field of type string or number needs to have enumValues");
    }

    return (
        <Field
            name={`${name}`}>
            {({
                  field,
                  form: { isSubmitting, touched, errors, setFieldValue },
                  meta
              }: any) => {

                const fieldError = getIn(errors, field.name);
                const showError = getIn(touched, field.name) && !!fieldError;

                return <FormControl
                    fullWidth
                    required={property.validation?.required}
                    error={showError}
                >
                    <InputLabel
                        id={`${name}-label`}>{property.title || name}
                    </InputLabel>
                    <MuiSelect multiple
                               labelId={`${name}-label`}
                               value={!!value ? value : []}
                               onChange={(evt: any) => {
                                   return setFieldValue(
                                       `${name}`,
                                       evt.target.value
                                   );
                               }}
                               renderValue={(selected: any) => (
                                   <div>
                                       {selected.map((value: any) => {
                                           return renderPreviewEnumChip(enumValues, value);
                                       })}
                                   </div>
                               )}>
                        {Object.keys(enumValues).map(key => {
                            return (
                                <MenuItem key={key} value={key}>
                                    <Checkbox
                                        checked={!!value && value.indexOf(key) > -1}/>
                                    <ListItemText
                                        primary={enumValues[key]}/>
                                </MenuItem>
                            );
                        })}
                    </MuiSelect>
                    <FormHelperText>{fieldError}</FormHelperText>
                </FormControl>;
            }
            }
        </Field>
    );
}
