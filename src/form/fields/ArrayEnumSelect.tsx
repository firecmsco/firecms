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
import { FieldDescription } from "../../components";
import { LabelWithIcon } from "../../components/LabelWithIcon";
import { PreviewSize } from "../../preview/PreviewComponentProps";
import { CustomChip } from "../../preview/components/CustomChip";

type ArrayEnumSelectProps<T extends EnumType> = CMSFieldProps<T[]>;

export default function ArrayEnumSelect<T extends EnumType>({
                                                                field,
                                                                form: { errors, touched, setFieldValue, setFieldTouched, isSubmitting },
                                                                property,
                                                                includeDescription
                                                            }: ArrayEnumSelectProps<T>) {
    if(!("dataType" in property.of)){
        throw Error("Using wrong component ArrayEnumSelect");
    }

    if (property.of.dataType !== "string" && property.of.dataType !== "number") {
        throw Error("Field misconfiguration: array field of type string or number");
    }

    const enumValues: EnumValues<number | string> | undefined = property.of.config?.enumValues;
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
        <div style={{ marginTop: "-4px" }}>
            <InputLabel id={`${field.name}-multiselect-label`} style={{
                marginLeft: "10px"
            }}>
                <LabelWithIcon property={property}/>
            </InputLabel>
        </div>
        <MuiSelect multiple
                   variant={"filled"}
                   labelId={`${field.name}-multiselect-label`}
                   value={!!field.value ? field.value : []}
                   style={{minHeight: "64px",padding: "4px" }}
                   disabled={isSubmitting}
                   onChange={(evt: any) => {
                       setFieldTouched(field.name);
                       return setFieldValue(
                           `${field.name}`,
                           evt.target.value
                       );
                   }}
                   renderValue={(selected: any) => (
                       <div>
                           {selected && selected.map((value: any) => {
                               return renderPreviewEnumChip(field.name, enumValues, value, "regular");
                           })}
                       </div>
                   )}>
            {Object.keys(enumValues).map(key => {
                return (
                    <MenuItem key={key} value={key}>
                        <Checkbox
                            checked={!!field.value && field.value.indexOf(key as any) > -1}/>
                        <ListItemText
                            primary={renderPreviewEnumChip(field.name, enumValues, key, "regular")}/>
                    </MenuItem>
                );
            })}
        </MuiSelect>
        <FormHelperText>{fieldError}</FormHelperText>

        {includeDescription &&
        <FieldDescription property={property}/>}

    </FormControl>;
}

function renderPreviewEnumChip<T extends EnumType>(
    name: string,
    enumValues: EnumValues<T>,
    value: T,
    size: PreviewSize
) {
    if (!value) return null;

    const label = enumValues[value];
    const key: string = typeof value == "number" ? `${name}_${value}` : value as string;

    return <CustomChip colorKey={key}
                       label={label || value}
                       error={!label}
                       outlined={false}
                       small={size !== "regular"}/>;

}
