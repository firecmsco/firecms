import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState
} from "react";
import equal from "react-fast-compare"
import {
    CMSType,
    Entity,
    EntityCollection,
    EntityReference,
    ResolvedArrayProperty,
    ResolvedNumberProperty,
    ResolvedProperty,
    ResolvedStringProperty
} from "../../../../types";
import { TableInput } from "../../Table/fields/TableInput";
import { TableSelect } from "../../Table/fields/TableSelect";
import { NumberTableInput } from "../../Table/fields/TableNumberInput";
import { TableSwitch } from "../../Table/fields/TableSwitch";
import { TableDateField } from "../../Table/fields/TableDateField";
import { PropertyPreview } from "../../../../preview";
import { TableReferenceField } from "../fields/TableReferenceField";

import { getPreviewSizeFrom } from "../../../../preview/util";
import { isReadOnly } from "../../../util";
import { TableStorageUpload } from "../fields/TableStorageUpload";
import {
    CustomFieldValidator,
    mapPropertyToYup
} from "../../../../form/validation";
import { useEntityCollectionTableController } from "../EntityCollectionTable";
import {
    useClearRestoreValue,
    useDataSource,
    useFireCMSContext
} from "../../../../hooks";
import { TableCell } from "./TableCell";
import { getRowHeight } from "../../Table/common";

export interface PropertyTableCellProps<T extends CMSType, M extends Record<string, any>> {
    propertyKey: string;
    columnIndex: number;
    align: "right" | "left" | "center";
    customFieldValidator?: CustomFieldValidator;
    value: T;
    readonly: boolean;
    collection: EntityCollection<M>;
    setFocused: (value: boolean) => void;
    property: ResolvedProperty<T>;
    height: number;
    width: number;
    entity: Entity<any>;
    path: string;
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
                                                                                     columnIndex,
                                                                                     customFieldValidator,
                                                                                     value,
                                                                                     property,
                                                                                     align,
                                                                                     width,
                                                                                     height,
                                                                                     collection,
                                                                                     path,
                                                                                     entity,
                                                                                     readonly
                                                                                 }: PropertyTableCellProps<T, M>) {

        const dataSource = useDataSource();
        const context = useFireCMSContext();

        const {
            onValueChange,
            size,
            selectedCell,
            focused,
            select,
            setPopupCell,
            selectedEntityIds
        } = useEntityCollectionTableController();
        const selectedRow = selectedEntityIds?.includes(entity.id) ?? false;

        const selected = selectedCell?.columnIndex === columnIndex &&
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
        const disabled = Boolean(property.disabled);

        const validation = useMemo(() => mapPropertyToYup({
            property,
            entityId: entity.id,
            customFieldValidator,
            name: propertyKey
        }), [entity.id, property, propertyKey]);

        useEffect(
            () => {
                if (!equal(value, internalValueRef.current)) {
                    setInternalValue(value);
                    internalValueRef.current = value;
                    onValueUpdated();
                }
            },
            [onValueUpdated, value]
        );

        const saveValues = useCallback((value: any) => {
            setSaved(false);
            validation
                .validate(value)
                .then(() => {
                    setError(undefined);
                    if (onValueChange) {
                        onValueChange({
                            value,
                            propertyKey,
                            setError,
                            onValueUpdated,
                            entity,
                            fullPath: path,
                            collection,
                            dataSource,
                            context
                        });
                    }
                })
                .catch((e) => {
                    setError(e);
                });
        }, [entity, onValueChange, propertyKey, validation]);

        useEffect(() => {
            validation
                .validate(internalValue)
                .catch((e) => {
                    setError(e);
                });
        }, [internalValue, validation]);

        const updateValue = useCallback(
            (newValue: any | null) => {

                let updatedValue: any;
                if (newValue === undefined) {
                    updatedValue = null;
                } else {
                    updatedValue = newValue;
                }
                internalValueRef.current = updatedValue;
                setInternalValue(updatedValue);
                saveValues(updatedValue);
            },
            [saveValues]
        );

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
                    columnIndex,
                    width,
                    height,
                    entity,
                    cellRect,
                    propertyKey: propertyKey as keyof M,
                    collection
                });
            }
        }, [collection, columnIndex, entity, height, propertyKey, select, width]);

        const openPopup = useCallback((cellRect: DOMRect | undefined) => {
            if (!cellRect) {
                setPopupCell(undefined);
            } else {
                setPopupCell({
                    columnIndex,
                    width,
                    height,
                    entity,
                    cellRect,
                    propertyKey: propertyKey as keyof M,
                    collection
                });
            }
        }, [collection, columnIndex, entity, height, propertyKey, width]);

        let innerComponent: React.ReactNode | undefined;
        let allowScroll = false;
        let showExpandIcon = false;
        let removePadding = false;
        let fullHeight = false;

        if (readonly || readOnlyProperty) {
            return <TableCell
                size={size}
                width={width}
                focused={focused}
                saved={saved}
                selectedRow={selectedRow}
                key={`preview_cell_${propertyKey}_${entity.id}`}
                value={internalValue}
                align={align ?? "left"}
                disabledTooltip={disabledTooltip ?? (readOnlyProperty ? "Read only" : undefined)}
                disabled={true}>
                <PropertyPreview
                    width={width}
                    height={getRowHeight(size)}
                    propertyKey={propertyKey}
                    property={property}
                    entity={entity}
                    value={value}
                    size={getPreviewSizeFrom(size)}
                />
            </TableCell>;
        }

        if (!customField && (!customPreview || selected)) {
            const isAStorageProperty = isStorageProperty(property);
            if (isAStorageProperty) {
                innerComponent = <TableStorageUpload error={error}
                                                     disabled={disabled}
                                                     focused={focused}
                                                     property={property as ResolvedStringProperty | ResolvedArrayProperty<string[]>}
                                                     entity={entity}
                                                     path={path}
                                                     value={internalValue}
                                                     previewSize={getPreviewSizeFrom(size)}
                                                     updateValue={updateValue}
                                                     propertyKey={propertyKey as string}
                />;
                showExpandIcon = true;
                fullHeight = true;
                removePadding = true;
            } else if (selected && property.dataType === "number") {
                const numberProperty = property as ResolvedNumberProperty;
                if (numberProperty.enumValues) {
                    innerComponent = <TableSelect name={propertyKey as string}
                                                  multiple={false}
                                                  disabled={disabled}
                                                  focused={focused}
                                                  valueType={"number"}
                                                  small={getPreviewSizeFrom(size) !== "regular"}
                                                  enumValues={numberProperty.enumValues}
                                                  error={error}
                                                  internalValue={internalValue as string | number}
                                                  updateValue={updateValue}
                    />;
                    fullHeight = true;
                } else {
                    innerComponent = <NumberTableInput
                        align={align}
                        error={error}
                        focused={focused}
                        disabled={disabled}
                        value={internalValue as number}
                        updateValue={updateValue}
                    />;
                    allowScroll = true;
                }
            } else if (selected && property.dataType === "string") {
                const stringProperty = property as ResolvedStringProperty;
                if (stringProperty.enumValues) {
                    innerComponent = <TableSelect name={propertyKey as string}
                                                  multiple={false}
                                                  focused={focused}
                                                  disabled={disabled}
                                                  valueType={"string"}
                                                  small={getPreviewSizeFrom(size) !== "regular"}
                                                  enumValues={stringProperty.enumValues}
                                                  error={error}
                                                  internalValue={internalValue as string | number}
                                                  updateValue={updateValue}
                    />;
                    fullHeight = true;
                } else if (!stringProperty.storage) {
                    const multiline = Boolean(stringProperty.multiline) || Boolean(stringProperty.markdown);
                    innerComponent = <TableInput error={error}
                                                 disabled={disabled}
                                                 multiline={multiline}
                                                 focused={focused}
                                                 value={internalValue as string}
                                                 updateValue={updateValue}
                    />;
                    allowScroll = true;
                }
            } else if (property.dataType === "boolean") {
                innerComponent = <TableSwitch error={error}
                                              disabled={disabled}
                                              focused={focused && selected}
                                              internalValue={internalValue as boolean}
                                              updateValue={updateValue}
                />;
            } else if (property.dataType === "date") {
                innerComponent = <TableDateField name={propertyKey as string}
                                                 error={error}
                                                 disabled={disabled}
                                                 mode={property.mode}
                                                 focused={focused}
                                                 internalValue={internalValue as Date}
                                                 updateValue={updateValue}
                />;
                allowScroll = true;
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
                                <TableSelect name={propertyKey as string}
                                             multiple={true}
                                             disabled={disabled}
                                             focused={focused}
                                             small={getPreviewSizeFrom(size) !== "regular"}
                                             valueType={arrayProperty.of.dataType}
                                             enumValues={arrayProperty.of.enumValues}
                                             error={error}
                                             internalValue={internalValue as string | number}
                                             updateValue={updateValue}
                                />;
                            allowScroll = true;
                            fullHeight = true;
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
            <TableCell
                key={`table_cell_${entity.id}_${propertyKey}`}
                size={size}
                width={width}
                focused={focused}
                onSelect={onSelect}
                selected={selected}
                selectedRow={selectedRow}
                disabled={disabled || readOnlyProperty}
                disabledTooltip={disabledTooltip ?? "Disabled"}
                removePadding={removePadding}
                fullHeight={fullHeight}
                saved={saved}
                error={error}
                align={align}
                allowScroll={allowScroll}
                showExpandIcon={showExpandIcon}
                openPopup={!disabled ? openPopup : undefined}
                value={internalValue}
            >

                {innerComponent}

            </TableCell>
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
