import { EnumType, EnumValues } from "../../models";
import { getIn } from "formik";
import {
    Checkbox,
    FormControl,
    FormHelperText,
    InputLabel,
    ListItemText,
    MenuItem,
    Select as MuiSelect
} from "@material-ui/core";
import React from "react";
import { CMSFieldProps } from "../form_props";
import { renderPreviewEnumChip } from "../../preview/PreviewComponent";

type ArrayEnumSelectProps<T extends EnumType> = CMSFieldProps<T[]>;

export default function ArrayEnumSelect<T extends EnumType>({
                                                                field,
                                                                form: { errors, touched, setFieldValue, setFieldTouched },
                                                                property
                                                            }: ArrayEnumSelectProps<T>) {

    if (property.of.dataType !== "string" && property.of.dataType !== "number") {
        throw Error("Field misconfiguration: array field of type string or number");
    }

    const enumValues: EnumValues<number | string> | undefined = property.of.enumValues;
    if (!enumValues) {
        console.error(property);
        throw Error("Field misconfiguration: array field of type string or number needs to have enumValues");
    }

    const fieldError = getIn(errors, field.name);
    const showError = getIn(touched, field.name) && !!fieldError;

    return <FormControl
        fullWidth
        required={property.validation?.required}
        error={showError}
    >
        <InputLabel
            id={`${field.name}-label`}>{property.title || field.name}
        </InputLabel>
        <MuiSelect multiple
                   labelId={`${field.name}-label`}
                   value={!!field.value ? field.value : []}
                   onChange={(evt: any) => {
                       setFieldTouched(field.name);
                       return setFieldValue(
                           `${field.name}`,
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
                            checked={!!field.value && field.value.indexOf(key as any) > -1}/>
                        <ListItemText
                            primary={enumValues[key]}/>
                    </MenuItem>
                );
            })}
        </MuiSelect>
        <FormHelperText>{fieldError}</FormHelperText>
    </FormControl>;
}
