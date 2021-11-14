import { getCellAlignment, getPropertyColumnWidth } from "./internal/common";
import {
    AdditionalColumnDelegate,
    CMSType,
    CollectionSize,
    Entity,
    EntitySchema,
    EnumValues,
    FireCMSContext,
    Property,
    PropertyOrBuilder
} from "../../../models";
import { buildPropertyFrom } from "../../util/property_builder";
import React, { useCallback, useEffect, useMemo } from "react";
import { TableCell } from "../Table/TableCell";
import { PreviewComponent, SkeletonComponent } from "../../../preview";
import { getPreviewSizeFrom } from "../../../preview/util";
import {
    CustomFieldValidator,
    mapPropertyToYup
} from "../../../form/validation";
import {
    OnCellChangeParams,
    PropertyTableCell
} from "./internal/PropertyTableCell";
import { ErrorBoundary } from "../../internal/ErrorBoundary";
import { useFireCMSContext } from "../../../hooks";
import { PopupFormField } from "./internal/popup_field/PopupFormField";
import { TableColumn, TableColumnFilter, TableEnumValues } from "../../index";
import { getIconForProperty } from "../../util/property_icons";
import {
    buildEnumLabel,
    enumToObjectEntries,
    isEnumValueDisabled
} from "../../util/enums";


export type ColumnsFromSchemaProps<M, AdditionalKey extends string, UserType> = {

    /**
     * Absolute collection path
     */
    path: string;

    /**
     * Schema of the entity displayed by this collection
     */
    schema: EntitySchema<M>;

    /**
     * Properties displayed in this collection. If this property is not set
     * every property is displayed, you can filter
     */
    displayedProperties: string[];

    /**
     * You can add additional columns to the collection view by implementing
     * an additional column delegate.
     * Usually defined by the end user.
     */
    additionalColumns?: AdditionalColumnDelegate<M, AdditionalKey, UserType>[];

    /**
     * Can the table be edited inline
     */
    inlineEditing: ((entity: Entity<any>) => boolean) | boolean;

    /**
     * Size of the elements in the collection
     */
    size: CollectionSize;

    /**
     * Use this callback to validate if an entity field should be unique
     */
    uniqueFieldValidator?: UniqueFieldValidator;

    /**
     * Callback when the value of a cell has been edited
     * @param params
     */
    onCellValueChange?: OnCellValueChange<unknown, M>;

};

/**
 * @category Collection components
 */
export type UniqueFieldValidator = (props: { name: string, value: any, property: Property, entityId?: string }) => Promise<boolean>;

/**
 * Callback when a cell has changed in a table
 * @category Collection components
 */
export type OnCellValueChange<T, M extends { [Key: string]: any }> = (params: OnCellValueChangeParams<T, M>) => Promise<void>;

/**
 * Props passed in a callback when the content of a cell in a table has been edited
 * @category Collection components
 */
export interface OnCellValueChangeParams<T, M extends { [Key: string]: any }> {
    value: T,
    name: string,
    entity: Entity<M>,
    setSaved: (saved: boolean) => void
    setError: (e: Error) => void
}


export function checkInlineEditing<M>(inlineEditing: ((entity: Entity<any>) => boolean) | boolean, entity: Entity<M>) {
    if (typeof inlineEditing === "boolean") {
        return inlineEditing;
    } else if (typeof inlineEditing === "function") {
        return inlineEditing(entity);
    } else {
        return true;
    }
}

type SelectedCellProps<M> =
    {
        key: keyof M,
        columnIndex: number,
        cellRect: DOMRect;
        width: number,
        height: number,
        property: Property,
        entity: Entity<any>,
        usedPropertyBuilder: boolean,
    };


export function buildColumnsFromSchema<M, AdditionalKey extends string, UserType>({
                                                                                      schema,
                                                                                      additionalColumns,
                                                                                      displayedProperties,
                                                                                      path,
                                                                                      inlineEditing,
                                                                                      size,
                                                                                      onCellValueChange,
                                                                                      uniqueFieldValidator
                                                                                  }: ColumnsFromSchemaProps<M, AdditionalKey, UserType>
): { columns: TableColumn<M>[], popupFormField: React.ReactElement } {

    const context: FireCMSContext<UserType> = useFireCMSContext();

    const [selectedCell, setSelectedCell] = React.useState<SelectedCellProps<M> | undefined>(undefined);
    const [popupCell, setPopupCell] = React.useState<SelectedCellProps<M> | undefined>(undefined);
    const [focused, setFocused] = React.useState<boolean>(false);

    const [formPopupOpen, setFormPopupOpen] = React.useState<boolean>(false);
    const [preventOutsideClick, setPreventOutsideClick] = React.useState<boolean>(false);

    const [tableKey] = React.useState<string>(Math.random().toString(36));

    const additionalColumnsMap: Record<string, AdditionalColumnDelegate<M, string, UserType>> = useMemo(() => {
        return additionalColumns ?
            additionalColumns
                .map((aC) => ({ [aC.id]: aC }))
                .reduce((a, b) => ({ ...a, ...b }), [])
            : {};
    }, [additionalColumns]);

    // on ESC key press
    useEffect(() => {
        const escFunction = (event: any) => {
            if (event.keyCode === 27) {
                unselect();
            }
        };
        document.addEventListener("keydown", escFunction, false);
        return () => {
            document.removeEventListener("keydown", escFunction, false);
        };
    });

    const select = (cell?: SelectedCellProps<M>) => {
        setSelectedCell(cell);
        setFocused(true);
        if (!formPopupOpen) {
            setPopupCell(cell);
        }
    };

    const unselect = useCallback(() => {
        setSelectedCell(undefined);
        setFocused(false);
        setPreventOutsideClick(false);
    }, []);


    const updatePopup = (value: boolean) => {
        setFocused(!value);
        setFormPopupOpen(value);
    };

    const propertyCellRenderer = ({
                                      column,
                                      columnIndex,
                                      rowData,
                                      rowIndex
                                  }: any) => {

        const entity: Entity<M> = rowData;

        const key = column.dataKey as keyof M;
        const propertyOrBuilder: PropertyOrBuilder<any, M> = schema.properties[key];
        const property: Property<any> = buildPropertyFrom<CMSType, M>(propertyOrBuilder, entity.values, entity.id);
        const usedPropertyBuilder = typeof propertyOrBuilder === "function";

        const inlineEditingEnabled = checkInlineEditing(inlineEditing, entity);

        if (!inlineEditingEnabled) {
            return (
                <TableCell
                    key={`preview_cell_${key}_${rowIndex}_${columnIndex}`}
                    size={size}
                    align={column.align}
                    disabled={true}>
                    <PreviewComponent
                        width={column.width}
                        height={column.height}
                        name={`preview_${key}_${rowIndex}_${columnIndex}`}
                        property={property}
                        value={entity.values[key]}
                        size={getPreviewSizeFrom(size)}
                    />
                </TableCell>
            );
        } else {

            const openPopup = (cellRect: DOMRect | undefined) => {
                if (!cellRect) {
                    setPopupCell(undefined);
                } else {
                    setPopupCell({
                        columnIndex,
                        // rowIndex,
                        width: column.width,
                        height: column.height,
                        entity,
                        cellRect,
                        key,
                        property,
                        usedPropertyBuilder
                    });
                }
                updatePopup(true);
            };

            const onSelect = (cellRect: DOMRect | undefined) => {
                if (!cellRect) {
                    select(undefined);
                } else {
                    select({
                        columnIndex,
                        // rowIndex,
                        width: column.width,
                        height: column.height,
                        entity,
                        cellRect,
                        key,
                        property,
                        usedPropertyBuilder
                    });
                }
            };

            const selected = selectedCell?.columnIndex === columnIndex
                && selectedCell?.entity.id === entity.id;

            const isFocused = selected && focused;

            const customFieldValidator: CustomFieldValidator | undefined = uniqueFieldValidator
                ? ({ name, value, property }) => uniqueFieldValidator({
                    name, value, property, entityId: entity.id
                }) : undefined;

            const validation = mapPropertyToYup({
                property,
                customFieldValidator,
                name: key
            });

            const onValueChange = onCellValueChange
                ? (props: OnCellChangeParams<any>) => onCellValueChange({
                    ...props,
                    entity
                })
                : undefined;

            return entity ?
                <PropertyTableCell
                    key={`table_cell_${key}_${rowIndex}_${columnIndex}`}
                    size={size}
                    align={column.align}
                    name={key as string}
                    validation={validation}
                    onValueChange={onValueChange}
                    selected={selected}
                    focused={isFocused}
                    setPreventOutsideClick={setPreventOutsideClick}
                    setFocused={setFocused}
                    value={entity?.values ? entity.values[key] : undefined}
                    property={property}
                    openPopup={openPopup}
                    select={onSelect}
                    width={column.width}
                    height={column.height}/>
                :
                <SkeletonComponent property={property}
                                   size={getPreviewSizeFrom(size)}/>;
        }


    };
    const additionalCellRenderer = ({
                                        column,
                                        columnIndex,
                                        rowData,
                                        rowIndex
                                    }: any) => {

        const entity: Entity<M> = rowData;

        return (
            <TableCell
                focused={false}
                selected={false}
                disabled={true}
                size={size}
                align={"left"}
                allowScroll={false}
                showExpandIcon={false}
                disabledTooltip={"Additional columns can't be edited directly"}
            >
                <ErrorBoundary>
                    {(additionalColumnsMap[column.dataKey as AdditionalKey]).builder({
                        entity,
                        context
                    })}
                </ErrorBoundary>
            </TableCell>
        );

    };

    function buildFilterEnumValues(values: EnumValues): TableEnumValues {
        return enumToObjectEntries(values)
            .filter(([enumKey, labelOrConfig]) => !isEnumValueDisabled(labelOrConfig))
            .map(([enumKey, labelOrConfig]) => ({ [enumKey]: buildEnumLabel(labelOrConfig) as string }))
            .reduce((a, b) => ({ ...a, ...b }), {});
    }

    function buildFilterableFromProperty(property: Property,
                                         isArray: boolean = false): TableColumnFilter | undefined {

        if (property.dataType === "number" || property.dataType === "string") {
            const title = property.title;
            const enumValues = property.config?.enumValues;
            return {
                dataType: property.dataType,
                isArray,
                title,
                enumValues: enumValues ? buildFilterEnumValues(enumValues) : undefined
            };
        } else if (property.dataType === "array" && property.of) {
            return buildFilterableFromProperty(property.of, true);
        } else if (property.dataType === "boolean") {
            const title = property.title;
            return {
                dataType: property.dataType,
                isArray,
                title
            };
        } else if (property.dataType === "timestamp") {
            const title = property.title;
            return {
                dataType: property.dataType,
                isArray,
                title
            };
        }

        return undefined;

    }

    const columns = useMemo(() => {
        const allColumns: TableColumn<M>[] = (Object.keys(schema.properties) as (keyof M)[])
            .map((key) => {
                const property: Property<any> = buildPropertyFrom<any, M>(schema.properties[key], schema.defaultValues ?? {}, path);
                return ({
                    key: key as string,
                    property,
                    align: getCellAlignment(property),
                    icon: (hoverOrOpen) => getIconForProperty(property, hoverOrOpen ? undefined : "disabled", "small"),
                    label: property.title || key as string,
                    sortable: true,
                    filter: buildFilterableFromProperty(property),
                    width: getPropertyColumnWidth(property),
                    cellRenderer: propertyCellRenderer
                });
            });

        if (additionalColumns) {
            const items: TableColumn<M>[] = additionalColumns.map((additionalColumn) =>
                ({
                    key: additionalColumn.id,
                    type: "additional",
                    align: "left",
                    sortable: false,
                    label: additionalColumn.title,
                    width: additionalColumn.width ?? 200,
                    cellRenderer: additionalCellRenderer
                }));
            allColumns.push(...items);
        }

        return displayedProperties
            .map((p) => {
                return allColumns.find(c => c.key === p);
            }).filter(c => !!c) as TableColumn<M>[];

    }, [displayedProperties, selectedCell, size]);


    const customFieldValidator: CustomFieldValidator | undefined = uniqueFieldValidator
        ? ({ name, value, property }) => uniqueFieldValidator({
            name,
            value,
            property,
            entityId: selectedCell?.entity.id
        })
        : undefined;

    const popupFormField = <>
        <PopupFormField
            cellRect={popupCell?.cellRect}
            columnIndex={popupCell?.columnIndex}
            name={popupCell?.key}
            property={popupCell?.property}
            usedPropertyBuilder={popupCell?.usedPropertyBuilder ?? false}
            entity={popupCell?.entity}
            tableKey={tableKey}
            customFieldValidator={customFieldValidator}
            schema={schema}
            path={path}
            formPopupOpen={formPopupOpen}
            onCellValueChange={onCellValueChange}
            setPreventOutsideClick={setPreventOutsideClick}
            setFormPopupOpen={updatePopup}
        />
    </>;

    return { columns, popupFormField };

}
