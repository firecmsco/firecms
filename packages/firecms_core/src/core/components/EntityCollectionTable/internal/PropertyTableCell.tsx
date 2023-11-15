import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import equal from "react-fast-compare"
import {
    CMSType,
    Entity,
    EntityReference,
    ResolvedArrayProperty,
    ResolvedNumberProperty,
    ResolvedProperty,
    ResolvedStringProperty
} from "../../../../types";

import { VirtualTableInput } from "../../VirtualTable/fields/VirtualTableInput";
import { VirtualTableSelect } from "../../VirtualTable/fields/VirtualTableSelect";
import { VirtualTableNumberInput } from "../../VirtualTable/fields/VirtualTableNumberInput";
import { VirtualTableSwitch } from "../../VirtualTable/fields/VirtualTableSwitch";
import { VirtualTableDateField } from "../../VirtualTable/fields/VirtualTableDateField";

import { TableStorageUpload } from "../fields/TableStorageUpload";
import { TableReferenceField } from "../fields/TableReferenceField";

import { PropertyPreview } from "../../../../preview";
import { getPreviewSizeFrom } from "../../../../preview/util";
import { isReadOnly } from "../../../util";

import { CustomFieldValidator, mapPropertyToYup } from "../../../../form/validation";
import { useEntityCollectionTableController } from "../EntityCollectionTable";
import { useClearRestoreValue, useFireCMSContext } from "../../../../hooks";

import { EntityTableCell } from "./EntityTableCell";
import { getRowHeight } from "../../VirtualTable/common";
import { EntityTableCellActions } from "./EntityTableCellActions";

export interface PropertyTableCellProps<T extends CMSType, M extends Record<string, any>> {
    propertyKey: string;
    columnIndex: number;
    align: "right" | "left" | "center";
    customFieldValidator?: CustomFieldValidator;
    value: T;
    readonly: boolean;
    property: ResolvedProperty<T>;
    height: number;
    width: number;
    entity: Entity<any>;
    path: string;
    disabled: boolean;
}

function isStorageProperty<T>(property: ResolvedProperty) {
    if (property.dataType === "string" && (property as ResolvedStringProperty).storage)
        return true;
    if (property.dataType === "array") {
        if (Array.isArray(property.of)) {
            return false;
        } else {
            return ((property as ResolvedArrayProperty).of as ResolvedProperty)?.dataType === "string" &&
                ((property as ResolvedArrayProperty).of as ResolvedStringProperty)?.storage
        }
    }
    return false;
}

export const PropertyTableCell = React.memo<PropertyTableCellProps<any, any>>(
    function PropertyTableCell<T extends CMSType, M extends Record<string, any>>({
                                                                                     propertyKey,
                                                                                     customFieldValidator,
                                                                                     value,
                                                                                     property,
                                                                                     align,
                                                                                     width,
                                                                                     height,
                                                                                     path,
                                                                                     entity,
                                                                                     readonly,
                                                                                     disabled: disabledProp
                                                                                 }: PropertyTableCellProps<T, M>) {

        const context = useFireCMSContext();

        const {
            onValueChange,
            size,
            selectedCell,
            select,
            setPopupCell
        } = useEntityCollectionTableController();

        const selected = selectedCell?.propertyKey === propertyKey &&
            selectedCell?.entity.path === entity.path &&
            selectedCell?.entity.id === entity.id;

        const [internalValue, setInternalValue] = useState<any | null>(value);
        const internalValueRef = useRef(value);

        const [error, setError] = useState<Error | undefined>();
        const [saved, setSaved] = useState<boolean>(false);

        const onValueUpdated = useCallback(() => {
            setSaved(true)
            setTimeout(() => {
                setSaved(false);
            }, 100);
        }, []);

        const customField = Boolean(property.Field);
        const customPreview = Boolean(property.Preview);
        const readOnlyProperty = isReadOnly(property);
        const disabledTooltip: string | undefined = typeof property.disabled === "object" ? property.disabled.disabledMessage : undefined;
        const disabled = readonly || disabledProp || Boolean(property.disabled);

        const validation = useMemo(() => mapPropertyToYup({
            property,
            entityId: entity.id,
            customFieldValidator,
            name: propertyKey
        }), [entity.id, property, propertyKey]);

        useEffect(
            () => {
                if (!equal(value, internalValueRef.current)) {
                    setError(undefined);
                    setInternalValue(value);
                    internalValueRef.current = value;
                    onValueUpdated();
                }
            },
            [onValueUpdated, value]
        );

        const saveValues = (value: any) => {
            if (equal(value, internalValueRef.current))
                return;
            setSaved(false);
            validation
                .validate(value)
                .then(() => {
                    setError(undefined);
                    internalValueRef.current = value;
                    if (onValueChange) {
                        onValueChange({
                            value,
                            propertyKey,
                            setError,
                            onValueUpdated,
                            entity,
                            fullPath: path,
                            context
                        });
                    }
                })
                .catch((e) => {
                    setError(e);
                });
        };

        useEffect(() => {
            validation
                .validate(internalValue)
                .then(() => setError(undefined))
                .catch((e) => {
                    setError(e);
                });
        }, [internalValue, validation]);

        const updateValue = (newValue: any | null) => {

            let updatedValue: any;
            if (newValue === undefined) {
                updatedValue = null;
            } else {
                updatedValue = newValue;
            }
            setInternalValue(updatedValue);
            saveValues(updatedValue);
        };

        useClearRestoreValue<any>({
            property,
            value: internalValue,
            setValue: updateValue
        });

        const onSelect = useCallback((cellRect: DOMRect | undefined) => {
            if (!cellRect) {
                select(undefined);
            } else {
                select({
                    width,
                    height,
                    entity,
                    cellRect,
                    propertyKey: propertyKey as Extract<keyof M, string>,
                });
            }
        }, [entity, height, propertyKey, select, width]);

        const openPopup = (cellRect: DOMRect | undefined) => {
            if (!setPopupCell)
                return;
            if (!cellRect) {
                setPopupCell(undefined);
            } else {
                setPopupCell({
                    width,
                    height,
                    entity,
                    cellRect,
                    propertyKey: propertyKey as Extract<keyof M, string>
                });
            }
        };

        let innerComponent: React.ReactNode | undefined;
        let allowScroll = false;
        let showExpandIcon = false;
        let hideOverflow = true;
        let removePadding = false;
        let fullHeight = false;
        let includeActions = true;
        const showError = !disabled && error;

        if (readonly || readOnlyProperty) {
            return <EntityTableCell
                size={size}
                width={width}
                saved={saved}
                key={`${propertyKey}_${entity.path}_${entity.id}`}
                value={internalValue}
                align={align ?? "left"}
                fullHeight={false}
                disabledTooltip={disabledTooltip ?? (readOnlyProperty ? "Read only" : undefined)}
                disabled={true}>
                <PropertyPreview
                    width={width}
                    height={getRowHeight(size)}
                    propertyKey={propertyKey}
                    property={property}
                    entity={entity}
                    value={internalValue}
                    size={getPreviewSizeFrom(size)}
                />
            </EntityTableCell>;
        }

        if (!customField && (!customPreview || selected)) {
            const isAStorageProperty = isStorageProperty(property);
            if (isAStorageProperty) {
                innerComponent = <TableStorageUpload error={error}
                                                     disabled={disabled}
                                                     focused={selected}
                                                     selected={selected}
                                                     openPopup={setPopupCell ? openPopup : undefined}
                                                     property={property as ResolvedStringProperty | ResolvedArrayProperty<string[]>}
                                                     entity={entity}
                                                     path={path}
                                                     value={internalValue}
                                                     previewSize={getPreviewSizeFrom(size)}
                                                     updateValue={updateValue}
                                                     propertyKey={propertyKey as string}
                />;
                includeActions = false;
                showExpandIcon = true;
                fullHeight = true;
                removePadding = true;
            } else if (selected && property.dataType === "number") {
                const numberProperty = property as ResolvedNumberProperty;
                if (numberProperty.enumValues) {
                    innerComponent = <VirtualTableSelect name={propertyKey as string}
                                                         multiple={false}
                                                         disabled={disabled}
                                                         focused={selected}
                                                         valueType={"number"}
                                                         small={getPreviewSizeFrom(size) !== "medium"}
                                                         enumValues={numberProperty.enumValues}
                                                         error={error}
                                                         internalValue={internalValue as string | number}
                                                         updateValue={updateValue}
                    />;
                    fullHeight = true;
                } else {
                    innerComponent = <VirtualTableNumberInput
                        align={align}
                        error={error}
                        focused={selected}
                        disabled={disabled}
                        value={internalValue as number}
                        updateValue={updateValue}
                    />;
                    allowScroll = true;
                }
            } else if (selected && property.dataType === "string") {
                const stringProperty = property as ResolvedStringProperty;
                if (stringProperty.enumValues) {
                    innerComponent = <VirtualTableSelect name={propertyKey as string}
                                                         multiple={false}
                                                         focused={selected}
                                                         disabled={disabled}
                                                         valueType={"string"}
                                                         small={getPreviewSizeFrom(size) !== "medium"}
                                                         enumValues={stringProperty.enumValues}
                                                         error={error}
                                                         internalValue={internalValue as string | number}
                                                         updateValue={updateValue}
                    />;
                    fullHeight = true;
                } else if (!stringProperty.storage) {
                    const multiline = Boolean(stringProperty.multiline) || Boolean(stringProperty.markdown);
                    innerComponent = <VirtualTableInput error={error}
                                                        disabled={disabled}
                                                        multiline={multiline}
                                                        focused={selected}
                                                        value={internalValue as string}
                                                        updateValue={updateValue}
                    />;
                    allowScroll = true;
                }
            } else if (property.dataType === "boolean") {
                innerComponent = <VirtualTableSwitch error={error}
                                                     disabled={disabled}
                                                     focused={selected}
                                                     internalValue={internalValue as boolean}
                                                     updateValue={updateValue}
                />;
            } else if (property.dataType === "date") {
                innerComponent = <VirtualTableDateField name={propertyKey as string}
                                                        error={error}
                                                        disabled={disabled}
                                                        mode={property.mode}
                                                        focused={selected}
                                                        internalValue={internalValue as Date}
                                                        updateValue={updateValue}
                />;
                fullHeight = true;
                hideOverflow = false;
                allowScroll = false;
            } else if (property.dataType === "reference") {
                if (typeof property.path === "string") {
                    innerComponent =
                        <TableReferenceField name={propertyKey as string}
                                             internalValue={internalValue as EntityReference}
                                             updateValue={updateValue}
                                             disabled={disabled}
                                             size={size}
                                             path={property.path}
                                             multiselect={false}
                                             previewProperties={property.previewProperties}
                                             title={property.name}
                                             forceFilter={property.forceFilter}
                        />;
                }
                allowScroll = false;
            } else if (property.dataType === "array") {
                const arrayProperty = (property as ResolvedArrayProperty);

                if (!arrayProperty.of && !arrayProperty.oneOf) {
                    throw Error(`You need to specify an 'of' or 'oneOf' prop (or specify a custom field) in your array property ${propertyKey}`);
                }
                if (arrayProperty.of && !Array.isArray(arrayProperty.of)) {
                    if (arrayProperty.of.dataType === "string" || arrayProperty.of.dataType === "number") {
                        if (selected && arrayProperty.of.enumValues) {
                            innerComponent =
                                <VirtualTableSelect name={propertyKey as string}
                                                    multiple={true}
                                                    disabled={disabled}
                                                    focused={selected}
                                                    small={getPreviewSizeFrom(size) !== "medium"}
                                                    valueType={arrayProperty.of.dataType}
                                                    enumValues={arrayProperty.of.enumValues}
                                                    error={error}
                                                    internalValue={internalValue as string | number}
                                                    updateValue={updateValue}
                                />;
                            allowScroll = true;
                            fullHeight = true;
                            hideOverflow = false;
                        }
                    } else if (arrayProperty.of.dataType === "reference") {
                        if (typeof arrayProperty.of.path === "string") {
                            innerComponent =
                                <TableReferenceField
                                    name={propertyKey as string}
                                    disabled={disabled}
                                    internalValue={internalValue as EntityReference[]}
                                    updateValue={updateValue}
                                    size={size}
                                    multiselect={true}
                                    path={arrayProperty.of.path}
                                    previewProperties={arrayProperty.of.previewProperties}
                                    title={arrayProperty.of.name}
                                    forceFilter={arrayProperty.of.forceFilter}
                                />;
                        }
                        allowScroll = false;
                    }
                }

            }
        }

        if (!innerComponent) {
            allowScroll = false;
            showExpandIcon = selected && !innerComponent && !disabled && !readOnlyProperty;
            innerComponent = (
                <PropertyPreview
                    width={width}
                    height={height}
                    entity={entity}
                    propertyKey={propertyKey as string}
                    value={internalValue}
                    property={property}
                    size={getPreviewSizeFrom(size)}
                />
            );
        }

        return (
            <EntityTableCell
                key={`cell_${propertyKey}_${entity.path}_${entity.id}`}
                size={size}
                width={width}
                onSelect={onSelect}
                selected={selected}
                disabled={disabled || readOnlyProperty}
                disabledTooltip={disabledTooltip ?? "Disabled"}
                removePadding={removePadding}
                fullHeight={fullHeight}
                saved={saved}
                error={error}
                align={align}
                allowScroll={allowScroll}
                showExpandIcon={showExpandIcon}
                value={internalValue}
                hideOverflow={hideOverflow}
                actions={includeActions && <EntityTableCellActions
                    showError={showError}
                    disabled={disabled}
                    showExpandIcon={showExpandIcon}
                    selected={selected}
                    openPopup={!disabled ? openPopup : undefined}/>}
            >

                {innerComponent}

            </EntityTableCell>
        );

    },
    areEqual) as React.FunctionComponent<PropertyTableCellProps<any, any>>;

function areEqual(prevProps: PropertyTableCellProps<any, any>, nextProps: PropertyTableCellProps<any, any>) {
    return prevProps.height === nextProps.height &&
        prevProps.propertyKey === nextProps.propertyKey &&
        prevProps.align === nextProps.align &&
        prevProps.width === nextProps.width &&
        equal(prevProps.property, nextProps.property) &&
        equal(prevProps.value, nextProps.value) &&
        equal(prevProps.entity.values, nextProps.entity.values)
        ;
}
