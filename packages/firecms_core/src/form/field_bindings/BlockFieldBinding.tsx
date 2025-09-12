import React, { useEffect, useState } from "react";

import { Field, useFormex } from "@firecms/formex";

import { FieldHelperText, LabelWithIconAndTooltip } from "../components";
import { PropertyFieldBinding } from "../PropertyFieldBinding";
import { EnumValuesChip } from "../../preview";
import { ArrayProperty, FieldProps, FormContext, Property, PropertyFieldBindingProps } from "@firecms/types";
import { DEFAULT_ONE_OF_TYPE, DEFAULT_ONE_OF_VALUE, getDefaultValueFor, mergeDeep, } from "@firecms/common";
import { getIconForProperty, } from "../../util";
import { cls, ExpandablePanel, paperMixin, Select, SelectItem, Typography } from "@firecms/ui";
import { useClearRestoreValue } from "../useClearRestoreValue";
import { ArrayContainer, ArrayEntryParams } from "../../components";

/**
 * If the `oneOf` property is specified, this fields render each array entry as
 * a `type` select and the corresponding field widget to the selected `type.
 *
 * This is one of the internal components that get mapped natively inside forms
 * and tables to the specified properties.
 * @group Form fields
 */
export function BlockFieldBinding({
                                      propertyKey,
                                      value,
                                      error,
                                      showError,
                                      isSubmitting,
                                      setValue,
                                      setFieldValue,
                                      minimalistView: minimalistViewProp,
                                      property,
                                      includeDescription,
                                      underlyingValueHasChanged,
                                      context,
                                      disabled
                                  }: FieldProps<ArrayProperty>) {

    const minimalistView = minimalistViewProp || property.minimalistView;

    if (!property.oneOf)
        throw Error("ArrayOneOfField misconfiguration. Property `oneOf` not set");

    const expanded = property.expanded === undefined ? true : property.expanded;
    useClearRestoreValue({
        property,
        value,
        setValue
    });

    const [lastAddedId, setLastAddedId] = useState<number | undefined>();

    const buildEntry = ({
                            index,
                            internalId,
                            storedProps,
                            storeProps
                        }: ArrayEntryParams) => {

        return <BlockEntry
            key={`array_one_of_${internalId}`}
            name={`${propertyKey}.${index}`}
            index={index}
            value={value[index]}
            typeField={property.oneOf!.typeField ?? DEFAULT_ONE_OF_TYPE}
            valueField={property.oneOf!.valueField ?? DEFAULT_ONE_OF_VALUE}
            properties={property.oneOf!.properties}
            autoFocus={internalId === lastAddedId}
            context={context}
            storeProps={storeProps}
            storedProps={storedProps}/>;
    };

    const title = (
        <LabelWithIconAndTooltip
            propertyKey={propertyKey}
            icon={getIconForProperty(property, "small")}
            required={property.validation?.required}
            title={property.name ?? propertyKey}
            className={"text-text-secondary dark:text-text-secondary-dark"}/>
    );

    const firstOneOfKey = Object.keys(property.oneOf.properties)[0];
    const body = <ArrayContainer value={value}
                                 className={"flex flex-col gap-3"}
                                 droppableId={propertyKey}
                                 addLabel={property.name ? "Add entry to " + property.name : "Add entry"}
                                 buildEntry={buildEntry}
                                 onInternalIdAdded={setLastAddedId}
                                 disabled={isSubmitting || Boolean(property.disabled)}
                                 canAddElements={!property.disabled}
                                 onValueChange={(value) => setFieldValue(propertyKey, value)}
                                 newDefaultEntry={{
                                     [property.oneOf!.typeField ?? DEFAULT_ONE_OF_TYPE]: firstOneOfKey,
                                     [property.oneOf!.valueField ?? DEFAULT_ONE_OF_VALUE]: getDefaultValueFor(property.oneOf.properties[firstOneOfKey])
                                 }}/>;
    return (

        <>

            {!minimalistView &&
                <ExpandablePanel
                    innerClassName={"px-2 md:px-4 pb-2 md:pb-4 pt-1 md:pt-2"}
                    initiallyExpanded={expanded}
                    title={title}>
                    {body}
                </ExpandablePanel>}

            {minimalistView && body}

            <FieldHelperText includeDescription={includeDescription}
                             showError={showError}
                             error={error}
                             disabled={disabled}
                             property={property}/>

        </>
    );
}

interface BlockEntryProps {
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
    properties: Record<string, Property>;

    /**
     * Additional values related to the state of the form or the entity
     */
    context: FormContext<any>;

    storedProps?: object,
    storeProps: (props: object) => void

}

function BlockEntry({
                        name,
                        index,
                        value,
                        typeField,
                        valueField,
                        properties,
                        autoFocus,
                        context,
                        storedProps,
                        storeProps
                    }: BlockEntryProps) {

    const type = value && value[typeField];
    const [typeInternal, setTypeInternal] = useState<string | undefined>(type ?? undefined);

    const formex = useFormex();

    useEffect(() => {
        if (!type) {
            updateType(Object.keys(properties)[0]);
        }
    }, []);

    useEffect(() => {
        if (type !== typeInternal) {
            setTypeInternal(type);
        }
    }, [type]);

    const propertyInternal = typeInternal ? properties[typeInternal] : undefined;

    const property = storedProps && typeof propertyInternal === "object" ? mergeDeep(propertyInternal, storedProps) : propertyInternal;

    const enumValuesConfigs = Object.entries(properties)
        .map(([key, property]) => ({
            id: key,
            label: property.name ?? key
        }));

    const typeFieldName = `${name}.${typeField}`;
    const valueFieldName = `${name}.${valueField}`;

    const fieldProps: PropertyFieldBindingProps | undefined = property
        ? {
            propertyKey: valueFieldName,
            property,
            context,
            autoFocus,
            partOfArray: false,
            minimalistView: true,
            onPropertyChange: storeProps,
        }
        : undefined;

    const updateType = (newType: any) => {
        const newSelectedProperty = newType ? properties[newType] : undefined;
        setTypeInternal(newType);
        formex.setFieldTouched(typeFieldName, true);
        formex.setFieldValue(typeFieldName, newType);
        formex.setFieldValue(valueFieldName, newSelectedProperty ? getDefaultValueFor(newSelectedProperty) : null);
    };

    return (
        <div className={cls(paperMixin, "bg-transparent p-2")}>

            <Field
                name={typeFieldName}
            >
                {(fieldProps) => {
                    const value1 = fieldProps.field.value !== undefined && fieldProps.field.value !== null ? fieldProps.field.value as string : "";
                    return (
                        <>
                            <Select
                                className="mb-2"
                                placeholder={<Typography variant={"caption"}
                                                         className={"px-4 py-2 font-medium"}>Type</Typography>}
                                size={"medium"}
                                fullWidth={true}
                                position={"item-aligned"}
                                value={value1}
                                renderValue={(enumKey: any) =>
                                    <EnumValuesChip
                                        enumKey={enumKey}
                                        enumValues={enumValuesConfigs}
                                        size={"small"}/>
                                }
                                onValueChange={(value) => {
                                    updateType(value);
                                }}>
                                {enumValuesConfigs.map((enumConfig) => (
                                    <SelectItem
                                        key={enumConfig.id}
                                        value={String(enumConfig.id)}>
                                        <EnumValuesChip
                                            enumKey={enumConfig.id}
                                            enumValues={enumValuesConfigs}
                                            size={"small"}/>
                                    </SelectItem>)
                                )}
                            </Select>
                        </>
                    );
                }
                }
            </Field>

            {fieldProps && (
                // It is important to use this key to force a re-render of the field on type change
                <PropertyFieldBinding key={`form_control_${name}_${typeInternal}`} {...fieldProps}/>
            )}

        </div>
    );
}
