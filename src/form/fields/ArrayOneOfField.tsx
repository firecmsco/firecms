import React, { useEffect, useState } from "react";
import {
    FormControl,
    FormHelperText,
    InputLabel,
    MenuItem,
    Paper,
    Select
} from "@mui/material";
import { FastField, FieldProps as FormikFieldProps } from "formik";

import { formStyles } from "../styles";
import { ArrayContainer } from "../components/ArrayContainer";
import { FieldDescription } from "../components/FieldDescription";
import { useClearRestoreValue } from "../../hooks";
import { buildPropertyField } from "../form_factory";
import { LabelWithIcon } from "../components/LabelWithIcon";
import { EnumValuesChip } from "../../preview/components/CustomChip";
import { enumToObjectEntries } from "../../core/util/enums";
import { EnumValues, FieldProps, FormContext, Property } from "../../models";


/**
 * If the `oneOf` property is specified, this fields render each array entry as
 * a `type` select and the corresponding field widget to the selected `type.
 *
 * This is one of the internal components that get mapped natively inside forms
 * and tables to the specified properties.
 * @category Form fields
 */
export function ArrayOneOfField<T extends Array<any>>({
                                                          name,
                                                          value,
                                                          error,
                                                          showError,
                                                          isSubmitting,
                                                          setValue,
                                                          tableMode,
                                                          property,
                                                          includeDescription,
                                                          underlyingValueHasChanged,
                                                          context,
                                                          disabled,
                                                          dependsOnOtherProperties
                                                      }: FieldProps<T>) {

    if (!property.oneOf)
        throw Error("ArrayOneOfField misconfiguration. Property `oneOf` not set");

    const classes = formStyles();

    useClearRestoreValue({
        property,
        value,
        setValue
    });

    const buildEntry = (index: number, internalId: number) => {
        return <ArrayOneOfEntry
            key={`array_one_of_${index}`}
            name={`${name}[${index}]`}
            index={index}
            value={value[index]}
            typeField={property.oneOf!.typeField ?? "type"}
            valueField={property.oneOf!.valueField ?? "value"}
            properties={property.oneOf!.properties}
            context={context}/>;
    };

    return (

        <FormControl fullWidth error={showError}>

            {!tableMode && <FormHelperText filled
                                           required={property.validation?.required}>
                <LabelWithIcon property={property}/>
            </FormHelperText>}

            <Paper variant={"outlined"}
                   className={classes.paper}>
                <ArrayContainer value={value}
                                name={name}
                                buildEntry={buildEntry}
                                disabled={isSubmitting || Boolean(property.disabled)}
                                includeAddButton={!property.disabled}/>
            </Paper>

            {includeDescription &&
            <FieldDescription property={property}/>}

            {showError
            && typeof error === "string"
            && <FormHelperText>{error}</FormHelperText>}

        </FormControl>
    );
}

interface ArrayOneOfEntryProps {
    name: string;
    index: number;
    value: any;
    /**
     * Name of the field to use as the discriminator for type
     * Defaults to `type`
     */
    typeField: string;
    /**
     * Name of the  field to use as the value
     * Defaults to `value`
     */
    valueField: string;
    /**
     * Record of properties, where the key is the `type` and the value
     * is the corresponding property
     */
    properties: Record<string, Property>;

    /**
     * Additional values related to the state of the form or the entity
     */
    context: FormContext<any>;
}

function ArrayOneOfEntry({
                             name,
                             index,
                             value,
                             typeField,
                             valueField,
                             properties,
                             context
                         }: ArrayOneOfEntryProps) {

    const classes = formStyles();

    const type = value && value[typeField];

    useEffect(() => {
        if (type !== typeInternal) {
            setTypeInternal(type);
        }
    }, [type]);

    const [typeInternal, setTypeInternal] = useState<string | undefined>(type ?? undefined);

    const property = typeInternal ? properties[typeInternal] : undefined;

    const enumValues: EnumValues = Object.entries(properties).map(([key, property]) => ({ [key]: property.title ?? key })).reduce((a, b) => ({ ...a, ...b }));

    const typeFieldName = `${name}[${typeField}]`;
    const valueFieldName = `${name}[${valueField}]`;

    return (
        <Paper className={classes.paper} elevation={1}>

            <FormControl fullWidth>
                <InputLabel id={`${name}_${index}_select_label`}>
                    <span>Type</span>
                </InputLabel>

                <FastField
                    required={true}
                    name={typeFieldName}
                >
                    {(fieldProps: FormikFieldProps) =>
                        (
                            <Select
                                fullWidth
                                className={classes.oneOfInput}
                                labelId={`${name}_${index}_select_label`}
                                value={fieldProps.field.value !== undefined && fieldProps.field.value !== null ? fieldProps.field.value : ""}
                                onChange={(evt: any) => {
                                    const eventValue = evt.target.value;
                                    fieldProps.form.setFieldTouched(typeFieldName);
                                    setTypeInternal(eventValue);
                                    fieldProps.form.setFieldValue(typeFieldName, eventValue);
                                    fieldProps.form.setFieldValue(valueFieldName, null);
                                }}
                                renderValue={(enumKey: any) =>
                                    <EnumValuesChip
                                        enumKey={enumKey}
                                        enumValues={enumValues}
                                        small={true}/>
                                }>
                                {enumToObjectEntries(enumValues)
                                    .map(([enumKey, labelOrConfig]) => {
                                        return (
                                            <MenuItem
                                                key={`select_${name}_${index}_${enumKey}`}
                                                value={enumKey}>
                                                <EnumValuesChip
                                                    enumKey={enumKey}
                                                    enumValues={enumValues}
                                                    small={true}/>
                                            </MenuItem>
                                        );
                                    })}
                            </Select>
                        )
                    }
                </FastField>
            </FormControl>

            {property && (
                <FormControl fullWidth
                             key={`form_control_${name}_${typeInternal}`}>
                    {buildPropertyField({
                        name: valueFieldName,
                        property: property,
                        context: context
                    })}
                </FormControl>
            )}

        </Paper>
    );
}


