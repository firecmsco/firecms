import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import equal from "react-fast-compare"
import {
    ArrayProperty,
    Entity,
    EntityReference,
    EntityRelation,
    NumberProperty,
    Property,
    ReferenceProperty,
    StringProperty
} from "@firecms/types";

import { VirtualTableInput } from "../VirtualTable/fields/VirtualTableInput";
import { VirtualTableSelect } from "../VirtualTable/fields/VirtualTableSelect";
import { VirtualTableNumberInput } from "../VirtualTable/fields/VirtualTableNumberInput";
import { VirtualTableSwitch } from "../VirtualTable/fields/VirtualTableSwitch";
import { VirtualTableDateField } from "../VirtualTable/fields/VirtualTableDateField";

import { TableStorageUpload } from "./fields/TableStorageUpload";
import { TableReferenceField } from "./fields/TableReferenceField";

import { PropertyPreview } from "../../preview";
import { getPreviewSizeFrom } from "../../preview/util";

import { CustomFieldValidator, mapPropertyToYup } from "../../form/validation";

import { EntityTableCell } from "./internal/EntityTableCell";
import { EntityTableCellActions } from "./internal/EntityTableCellActions";

import { useSelectableTableController } from "../SelectableTable/SelectableTableContext";
import { useClearRestoreValue } from "../../form/useClearRestoreValue";
import { getRowHeight } from "../common/table_height";
import { isReadOnly } from "@firecms/common";
import { TableRelationField } from "./fields/TableRelationField";
import { TableRelationSelectorField } from "./fields/TableRelationSelectorField";

export interface PropertyTableCellProps<T> {
    propertyKey: string;
    columnIndex: number;
    align: "right" | "left" | "center";
    customFieldValidator?: CustomFieldValidator;
    value: T;
    readonly: boolean;
    property: Property;
    height: number;
    width: number;
    entity: Entity<any>;
    path: string;
    disabled: boolean;
    enablePopupIcon?: boolean;
}

function isStorageProperty(property: Property) {
    if (property.type === "string" && property.markdown)
        return false;
    if (property.type === "string" && (property as StringProperty).storage)
        return true;
    if (property.type === "array") {
        if (Array.isArray(property.of)) {
            return false;
        } else {
            return ((property as ArrayProperty).of as Property)?.type === "string" &&
                ((property as ArrayProperty).of as StringProperty)?.storage
        }
    }
    return false;
}

export const PropertyTableCell = React.memo<PropertyTableCellProps<any>>(
    function PropertyTableCell<T, M extends Record<string, any>>({
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
                                                                     disabled: disabledProp,
                                                                     enablePopupIcon = true
                                                                 }: PropertyTableCellProps<T>) {

        const {
            onValueChange,
            size,
            selectedCell,
            select,
            setPopupCell
        } = useSelectableTableController();

        const selected = selectedCell?.propertyKey === propertyKey &&
            selectedCell?.entityPath === entity.path &&
            selectedCell?.entityId === entity.id;

        const [internalValue, setInternalValue] = useState<any | null>(value);
        const internalValueRef = useRef(value);

        const [error, setError] = useState<Error | undefined>();
        const [validationError, setValidationError] = useState<Error | undefined>();
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
                    setValidationError(undefined);
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
                    setValidationError(undefined);
                    internalValueRef.current = value;
                    if (onValueChange) {
                        try {
                            onValueChange({
                                value,
                                propertyKey,
                                setError,
                                onValueUpdated,
                                data: entity,
                            });
                        } catch (e: any) {
                            console.error("onValueChange error", e);
                            setError(e);
                        }

                    }
                })
                .catch((e) => {
                    setValidationError(e);
                });
        };

        useEffect(() => {
            validation
                .validate(internalValue)
                .then(() => setValidationError(undefined))
                .catch(setValidationError);
        }, [internalValue, validation, propertyKey, property, entity]);

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
                    entityPath: entity.path,
                    entityId: entity.id,
                    cellRect,
                    propertyKey: propertyKey as Extract<keyof M, string>
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
                    entityPath: entity.path,
                    entityId: entity.id,
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
                    value={internalValue}
                    size={getPreviewSizeFrom(size)}
                />
            </EntityTableCell>;
        }

        if (!customField && (!customPreview || selected)) {
            const isAStorageProperty = isStorageProperty(property);
            if (property.type === "string" && (property as StringProperty).reference?.path) {
                const stringProperty = property as StringProperty;
                const path = stringProperty.reference?.path as string;
                const referenceProperty = stringProperty.reference as ReferenceProperty;
                const referenceValue = internalValue ? new EntityReference(internalValue, path) : undefined;
                innerComponent =
                    <TableReferenceField name={propertyKey as string}
                                         internalValue={referenceValue}
                                         updateValue={(v) => updateValue(v ? (v as EntityReference).id : null)}
                                         disabled={disabled}
                                         size={size}
                                         path={path}
                                         multiselect={false}
                                         previewProperties={referenceProperty.previewProperties}
                                         includeId={referenceProperty.includeId}
                                         includeEntityLink={referenceProperty.includeEntityLink}
                                         title={stringProperty.name}
                                         forceFilter={referenceProperty.forceFilter}
                    />;
                allowScroll = false;
            } else if (isAStorageProperty) {
                innerComponent = <TableStorageUpload error={validationError ?? error}
                                                     disabled={disabled}
                                                     focused={selected}
                                                     selected={selected}
                                                     openPopup={setPopupCell ? openPopup : undefined}
                                                     property={property as StringProperty | ArrayProperty}
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
            } else if (selected && property.type === "number") {
                const numberProperty = property as NumberProperty;
                if (numberProperty.enum) {
                    innerComponent = <VirtualTableSelect name={propertyKey as string}
                                                         multiple={false}
                                                         disabled={disabled}
                                                         focused={selected}
                                                         valueType={"number"}
                                                         small={getPreviewSizeFrom(size) !== "medium"}
                                                         enumValues={numberProperty.enum}
                                                         error={validationError ?? error}
                                                         internalValue={internalValue as string | number}
                                                         updateValue={updateValue}
                    />;
                    fullHeight = true;
                } else {
                    innerComponent = <VirtualTableNumberInput
                        align={align}
                        error={validationError ?? error}
                        focused={selected}
                        disabled={disabled}
                        value={internalValue as number}
                        updateValue={updateValue}
                    />;
                    allowScroll = true;
                }
            } else if (selected && property.type === "string") {
                const stringProperty = property as StringProperty;
                if (stringProperty.enum) {
                    innerComponent = <VirtualTableSelect name={propertyKey as string}
                                                         multiple={false}
                                                         focused={selected}
                                                         disabled={disabled}
                                                         valueType={"string"}
                                                         small={getPreviewSizeFrom(size) !== "medium"}
                                                         enumValues={stringProperty.enum}
                                                         error={validationError ?? error}
                                                         internalValue={internalValue as string | number}
                                                         updateValue={updateValue}
                    />;
                    fullHeight = true;
                } else if (stringProperty.markdown || !stringProperty.storage || !stringProperty.reference) {
                    const multiline = Boolean(stringProperty.multiline) || Boolean(stringProperty.markdown);
                    innerComponent = <VirtualTableInput error={validationError ?? error}
                                                        disabled={disabled}
                                                        multiline={multiline}
                                                        focused={selected}
                                                        value={internalValue as string}
                                                        updateValue={updateValue}
                    />;
                    allowScroll = true;
                }
            } else if (property.type === "boolean") {
                innerComponent = <VirtualTableSwitch error={validationError ?? error}
                                                     disabled={disabled}
                                                     focused={selected}
                                                     internalValue={internalValue as boolean}
                                                     updateValue={updateValue}
                />;
            } else if (property.type === "date") {
                innerComponent = <VirtualTableDateField name={propertyKey as string}
                                                        error={validationError ?? error}
                                                        disabled={disabled}
                                                        mode={property.mode}
                                                        focused={selected}
                                                        internalValue={internalValue as Date}
                                                        updateValue={updateValue}
                />;
                fullHeight = true;
                hideOverflow = false;
                allowScroll = false;
            } else if (property.type === "reference") {
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
                                             includeId={property.includeId}
                                             includeEntityLink={property.includeEntityLink}
                                             title={property.name ?? propertyKey}
                                             forceFilter={property.forceFilter}
                        />;
                }
                allowScroll = false;
            } else if (property.type === "relation") {
                if (property.relation) {
                    if (property.widget === "dialog") {
                        innerComponent =
                            <TableRelationField name={propertyKey as string}
                                                internalValue={internalValue as EntityRelation}
                                                updateValue={updateValue}
                                                disabled={disabled}
                                                size={size}
                                                multiselect={false}
                                                relation={property.relation}
                                                previewProperties={property.previewProperties}
                                                includeId={property.includeId}
                                                includeEntityLink={property.includeEntityLink}
                                                title={property.name ?? propertyKey}
                                                forceFilter={property.forceFilter}
                            />;
                    } else {
                        innerComponent = <TableRelationSelectorField name={propertyKey as string}
                                                                     internalValue={internalValue as EntityRelation}
                                                                     updateValue={updateValue}
                                                                     disabled={disabled}
                                                                     size={"small"}
                                                                     relation={property.relation}
                                                                     forceFilter={property.forceFilter}/>
                    }
                    allowScroll = false;
                }
            } else if (property.type === "array") {
                const arrayProperty = (property as ArrayProperty);

                if (!arrayProperty.of && !arrayProperty.oneOf) {
                    throw Error(`You need to specify an 'of' or 'oneOf' prop (or specify a custom field) in your array property ${propertyKey}`);
                }
                if (arrayProperty.of && !Array.isArray(arrayProperty.of)) {
                    if (arrayProperty.of.type === "string" || arrayProperty.of.type === "number") {
                        if (selected && arrayProperty.of.enum) {
                            innerComponent =
                                <VirtualTableSelect name={propertyKey as string}
                                                    multiple={true}
                                                    disabled={disabled}
                                                    focused={selected}
                                                    small={getPreviewSizeFrom(size) !== "medium"}
                                                    valueType={arrayProperty.of.type}
                                                    enumValues={arrayProperty.of.enum}
                                                    error={validationError ?? error}
                                                    internalValue={internalValue as string | number}
                                                    updateValue={updateValue}
                                />;
                            allowScroll = true;
                            fullHeight = true;
                            hideOverflow = false;
                        }
                    } else if (arrayProperty.of.type === "reference") {
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
                                    title={arrayProperty.name}
                                    forceFilter={arrayProperty.of.forceFilter}
                                    includeId={arrayProperty.of.includeId}
                                    includeEntityLink={arrayProperty.of.includeEntityLink}
                                />;
                        }
                        allowScroll = false;
                    }
                }

            }
        }

        if (!innerComponent) {
            allowScroll = false;
            showExpandIcon = enablePopupIcon && selected && !innerComponent && !disabled && !readOnlyProperty;
            innerComponent = (
                <PropertyPreview width={width}
                                 height={height}
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
                error={validationError ?? error}
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
    areEqual) as React.FunctionComponent<PropertyTableCellProps<any>>;

function areEqual(prevProps: PropertyTableCellProps<any>, nextProps: PropertyTableCellProps<any>) {
    return prevProps.height === nextProps.height &&
        prevProps.propertyKey === nextProps.propertyKey &&
        prevProps.align === nextProps.align &&
        prevProps.width === nextProps.width &&
        equal(prevProps.property, nextProps.property) &&
        equal(prevProps.value, nextProps.value) &&
        equal(prevProps.entity.id, nextProps.entity.id) &&
        equal(prevProps.entity.values, nextProps.entity.values)
        ;
}
