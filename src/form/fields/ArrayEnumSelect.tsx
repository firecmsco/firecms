import { ArrayProperty, EnumType, EnumValues, Property } from "../../models";
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
import React, { ReactElement } from "react";


interface ArrayEnumSelectProps<T extends EnumType> {
    name: string,
    arrayProperty: ArrayProperty<T>,
    values: any[],
    errors: any[],
    touched: any[],
    includeDescription: boolean,
    createFormField: (key: string, property: Property, value: any, includeDescription: boolean, error: any, touched: any) => ReactElement
}

export default function ArrayEnumSelect<T extends EnumType>({ name, arrayProperty, values }: ArrayEnumSelectProps<T>) {

    if (arrayProperty.of.dataType !== "string" && arrayProperty.of.dataType !== "number") {
        throw Error("Field misconfigured: array field of type string or number");
    }

    const enumValues: EnumValues<number | string> | undefined = arrayProperty.of.enumValues;
    if (!enumValues) {
        console.error(arrayProperty);
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
                    required={arrayProperty.validation?.required}
                    error={showError}
                >
                    <InputLabel
                        id={`${name}-label`}>{arrayProperty.title || name}
                    </InputLabel>
                    <MuiSelect multiple
                               labelId={`${name}-label`}
                               value={!!values ? values : []}
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
                                        checked={!!values && values.indexOf(key) > -1}/>
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
