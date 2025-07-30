import React from "react";
import { FieldProps, MapProperty, Properties, PropertyFieldBindingProps, ResolvedProperties } from "../../types";

import { ErrorBoundary } from "../../components";
import { getIconForProperty, isHidden, isReadOnly, pick } from "../../util";
import { FieldHelperText, LabelWithIconAndTooltip } from "../components";
import { PropertyFieldBinding } from "../PropertyFieldBinding";
import { cls, ExpandablePanel, InputLabel, Select, SelectItem } from "@firecms/ui";

/**
 * Field that renders the children property fields
 *
 * This is one of the internal components that get mapped natively inside forms
 * and tables to the specified properties.
 * @group Form fields
 */
export function MapFieldBinding({
                                    propertyKey,
                                    value,
                                    showError,
                                    error,
                                    disabled,
                                    property,
                                    partOfArray,
                                    minimalistView: minimalistViewProp,
                                    includeDescription,
                                    autoFocus,
                                    context,
                                    onPropertyChange
                                }: FieldProps<Record<string, any>>) {

    const pickOnlySomeKeys = property.pickOnlySomeKeys || false;
    const expanded = property.expanded === undefined ? true : property.expanded;
    const minimalistView = minimalistViewProp || property.minimalistView;

    if (!property.properties) {
        throw Error(`You need to specify a 'properties' prop (or specify a custom field) in your map property ${propertyKey}`);
    }

    let mapProperties: ResolvedProperties;
    if (pickOnlySomeKeys) {
        if (value) {
            mapProperties = pick(property.properties,
                ...Object.keys(value)
                    .filter(key => key in property.properties!)
            );
        } else {
            mapProperties = {};
        }
    } else {
        mapProperties = property.properties;
    }

    const mapFormView = <>
            <div
                className={cls("py-1 flex flex-col space-y-2", minimalistView && property.widthPercentage !== undefined ? "mt-8" : undefined)}>
                {Object.entries(mapProperties)
                    .filter(([_, property]) => !isHidden(property))
                    .map(([entryKey, childProperty], index) => {
                            const thisDisabled = isReadOnly(childProperty) || Boolean(childProperty.disabled);
                            const fieldBindingProps: PropertyFieldBindingProps<any> = {
                                propertyKey: `${propertyKey}.${entryKey}`,
                                disabled: disabled || thisDisabled,
                                property: childProperty,
                                includeDescription,
                                context,
                                partOfArray: false,
                                minimalistView: false,
                                autoFocus: autoFocus && index === 0,
                                onPropertyChange: function (updatedProperty) {
                                    onPropertyChange?.({
                                        properties: {
                                            [entryKey]: updatedProperty
                                        }
                                    } as Partial<MapProperty>);
                                }
                            };

                            return (
                                <div key={`map-${propertyKey}-${index}`} className={"relative"}>
                                    <ErrorBoundary>
                                        <PropertyFieldBinding
                                            {...fieldBindingProps}/>
                                    </ErrorBoundary>
                                </div>
                            )                                ;
                        }
                    )
                }
            </div>

            {/*{pickOnlySomeKeys && buildPickKeysSelect(disabled, property.properties, setValue, value)}*/}

        </>
    ;

    return (
        <ErrorBoundary>

            {!minimalistView && <ExpandablePanel initiallyExpanded={expanded}
                                                 onExpandedChange={(expanded) => {
                                                     onPropertyChange?.({
                                                         expanded
                                                     });
                                                 }}
                                                 className={property.widthPercentage !== undefined ? "mt-8" : undefined}
                                                 innerClassName={"px-2 md:px-4 pb-2 md:pb-4 pt-1 md:pt-2 bg-white dark:bg-surface-900"}
                                                 title={<LabelWithIconAndTooltip
                                                     propertyKey={propertyKey}
                                                     icon={getIconForProperty(property, "small")}
                                                     required={property.validation?.required}
                                                     title={property.name ?? propertyKey}
                                                     className={"text-text-secondary dark:text-text-secondary-dark"}/>}>
                {mapFormView}
            </ExpandablePanel>}

            {minimalistView && mapFormView}

            <FieldHelperText includeDescription={includeDescription}
                             showError={showError ?? false}
                             error={error && !partOfArray ? (typeof error === "string" ? error : "A property of this map has an error") : undefined}
                             disabled={disabled}
                             property={property}/>

        </ErrorBoundary>
    );
}

const buildPickKeysSelect = (disabled: boolean, properties: Properties, setValue: (value: any) => void, value: any) => {

    const keys = Object.keys(properties)
        .filter((key) => !value || !(key in value));

    const handleAddProperty = (updatedValue: string | string[]) => {
        setValue({
            ...value,
            [updatedValue as string]: null
        });
    };

    if (!keys.length) return <></>;

    return <div className={"m-4"}>
        <InputLabel>Add property</InputLabel>
        <Select
            value={""}
            size={"large"}
            fullWidth={true}
            disabled={disabled}
            onValueChange={handleAddProperty}
            renderValue={(key) => (properties as Properties)[key].name || key}>
            {keys.map((key) => <SelectItem key={key}
                                           value={key}>{(properties as Properties)[key].name || key}</SelectItem>)}
        </Select>
    </div>;
};
