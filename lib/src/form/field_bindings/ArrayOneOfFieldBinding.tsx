import React, { useCallback, useEffect, useState } from "react";
import {
    FormControl,
    FormHelperText,
    InputLabel,
    MenuItem,
    Paper,
    Select
} from "@mui/material";
import { FastField, FieldProps as FormikFieldProps } from "formik";

import { ArrayContainer, FieldDescription, LabelWithIcon } from "../components";
import { useClearRestoreValue } from "../../hooks";
import { PropertyFieldBinding } from "../PropertyFieldBinding";
import { EnumValuesChip } from "../../preview";
import { enumToObjectEntries } from "../../core/util/enums";
import {
    EnumValueConfig,
    FieldProps,
    FormContext,
    ResolvedProperty
} from "../../models";
import { ExpandablePanel } from "../../core/components/ExpandablePanel";
import {
    DEFAULT_ONE_OF_TYPE,
    DEFAULT_ONE_OF_VALUE
} from "../../core/util/common";

/**
 * If the `oneOf` property is specified, this fields render each array entry as
 * a `type` select and the corresponding field widget to the selected `type.
 *
 * This is one of the internal components that get mapped natively inside forms
 * and tables to the specified properties.
 * @category Form fields
 */
export function ArrayOneOfFieldBinding<T extends Array<any>>({
                                                          propertyKey,
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
                                                          shouldAlwaysRerender
                                                      }: FieldProps<T>) {

    if (!property.oneOf)
        throw Error("ArrayOneOfField misconfiguration. Property `oneOf` not set");

    const expanded = property.expanded === undefined ? true : property.expanded;
    useClearRestoreValue({
        property,
        value,
        setValue
    });

    const [lastAddedId, setLastAddedId] = useState<number | undefined>();

    const buildEntry = useCallback((index: number, internalId: number) => {
        return <ArrayOneOfEntry
            key={`array_one_of_${index}`}
            name={`${propertyKey}[${index}]`}
            index={index}
            value={value[index]}
            typeField={property.oneOf!.typeField ?? DEFAULT_ONE_OF_TYPE}
            valueField={property.oneOf!.valueField ?? DEFAULT_ONE_OF_VALUE}
            properties={property.oneOf!.properties}
            autoFocus={internalId === lastAddedId}
            shouldAlwaysRerender={shouldAlwaysRerender}
            context={context}/>;
    }, [context, lastAddedId, property.oneOf, propertyKey, value]);

    const title = (
        <LabelWithIcon property={property}/>
    );

    const body = <ArrayContainer value={value}
                                 name={propertyKey}
                                 buildEntry={buildEntry}
                                 onInternalIdAdded={setLastAddedId}
                                 disabled={isSubmitting || Boolean(property.disabled)}
                                 includeAddButton={!property.disabled}/>;
    return (

        <FormControl fullWidth error={showError}>

            {!tableMode && <ExpandablePanel expanded={expanded} title={title}>
                {body}
            </ExpandablePanel>}

            {tableMode && body}

            {includeDescription &&
                <FieldDescription property={property}/>}

            {showError &&
                typeof error === "string" &&
                <FormHelperText>{error}</FormHelperText>}

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

    autoFocus: boolean;
    /**
     * Record of properties, where the key is the `type` and the value
     * is the corresponding property
     */
    properties: Record<string, ResolvedProperty>;

    /**
     * Additional values related to the state of the form or the entity
     */
    context: FormContext<any>;

    shouldAlwaysRerender: boolean;
}

function ArrayOneOfEntry({
                             name,
                             index,
                             value,
                             typeField,
                             valueField,
                             properties,
                             autoFocus,
                             shouldAlwaysRerender,
                             context
                         }: ArrayOneOfEntryProps) {

    const type = value && value[typeField];
    const [typeInternal, setTypeInternal] = useState<string | undefined>(type ?? undefined);

    useEffect(() => {
        if (type !== typeInternal) {
            setTypeInternal(type);
        }
    }, [type]);

    const property = typeInternal ? properties[typeInternal] : undefined;

    const enumValues: EnumValueConfig[] = Object.entries(properties)
        .map(([key, property]) => ({ id: key, label: property.name ?? key }));

    const typeFieldName = `${name}[${typeField}]`;
    const valueFieldName = `${name}[${valueField}]`;

    const fieldProps = property
        ? {
            propertyKey: valueFieldName,
            property,
            context,
            autoFocus,
            tableMode: false,
            shouldAlwaysRerender: property.fromBuilder
        }
        : undefined;
    return (
        <Paper sx={(theme) => ({
            padding: theme.spacing(1),
            mb: 1
        })} elevation={0}>

            <FastField
                required={true}
                name={typeFieldName}
            >
                {(fieldProps: FormikFieldProps) =>
                    (
                        <FormControl fullWidth>
                            <InputLabel
                                id={`${name}_${index}_select_label`}>
                                <span>Type</span>
                            </InputLabel>
                            <Select
                                fullWidth
                                sx={{ marginBottom: 2 }}
                                labelId={`${name}_${index}_select_label`}
                                label={"Type"}
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
                        </FormControl>
                    )
                }
            </FastField>

            {fieldProps && (
                <FormControl fullWidth
                             key={`form_control_${name}_${typeInternal}`}>
                    <PropertyFieldBinding {...fieldProps}/>
                </FormControl>
            )}

        </Paper>
    );
}
