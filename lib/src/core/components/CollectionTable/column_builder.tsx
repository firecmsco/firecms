import { getCellAlignment, getPropertyColumnWidth } from "./internal/common";
import {
    AdditionalColumnDelegate,
    CollectionSize,
    Entity,
    EntitySchemaResolver,
    EnumValues,
    FireCMSContext,
    Property,
    ResolvedEntitySchema
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
import { getIconForProperty } from "../../util/property_utils";
import {
    buildEnumLabel,
    enumToObjectEntries,
    isEnumValueDisabled
} from "../../util/enums";
import { computeSchema } from "../../utils";


export type ColumnsFromSchemaProps<M, AdditionalKey extends string, UserType> = {

    /**
     * Absolute collection path
     */
    path: string;

    /**
     * Use to resolve the schema properties for specific path, entity id or values
     */
    schemaResolver: EntitySchemaResolver<M>;

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
        name: keyof M,
        columnIndex: number,
        cellRect: DOMRect;
        width: number,
        height: number,
        schemaResolver: EntitySchemaResolver<M>,
        entity: Entity<any>
    };


export function useBuildColumnsFromSchema<M, AdditionalKey extends string, UserType>({
                                                                                      schemaResolver,
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

    const [preventOutsideClick, setPreventOutsideClick] = React.useState<boolean>(false);

    const tableKey = React.useRef<string>(Math.random().toString(36));

    const additionalColumnsMap: Record<string, AdditionalColumnDelegate<M, string, UserType>> = useMemo(() => {
        return additionalColumns
            ? additionalColumns
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

    const select = useCallback((cell?: SelectedCellProps<M>) => {
        setSelectedCell(cell);
        setFocused(true);
    }, []);

    const unselect = useCallback(() => {
        setSelectedCell(undefined);
        setFocused(false);
        setPreventOutsideClick(false);
    }, []);

    const onPopupClose = useCallback(() => {
        setPopupCell(undefined);
        setFocused(true);
    }, []);

    const buildFilterEnumValues = useCallback((values: EnumValues): TableEnumValues => enumToObjectEntries(values)
        .filter(([enumKey, labelOrConfig]) => !isEnumValueDisabled(labelOrConfig))
        .map(([enumKey, labelOrConfig]) => ({ [enumKey]: buildEnumLabel(labelOrConfig) as string }))
        .reduce((a, b) => ({ ...a, ...b }), {}), []);

    const buildFilterableFromProperty = useCallback((property: Property,
                                                     isArray: boolean = false): TableColumnFilter | undefined => {

        if (property.dataType === "number" || property.dataType === "string") {
            const title = property.title;
            const enumValues = property.enumValues;
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

    }, [buildFilterEnumValues]);

    const resolvedSchema: ResolvedEntitySchema<M> = useMemo(() => computeSchema({
        schemaOrResolver: schemaResolver,
        path
    }), [schemaResolver, path]);

    const propertyCellRenderer = ({
                                      column,
                                      columnIndex,
                                      rowData,
                                      rowIndex
                                  }: any) => {


        const entity: Entity<M> = rowData;

        const name = column.dataKey as keyof M;

        const resolvedSchema = schemaResolver({
            entityId: entity.id,
            values: entity.values
        });
        const property = resolvedSchema.properties[name] as Property<any>;

        const inlineEditingEnabled = checkInlineEditing(inlineEditing, entity);

        if (!inlineEditingEnabled) {
            return (
                <TableCell
                    key={`preview_cell_${name}_${rowIndex}_${columnIndex}`}
                    size={size}
                    align={column.align}
                    disabled={true}>
                    <PreviewComponent
                        width={column.width}
                        height={column.height}
                        name={`preview_${name}_${rowIndex}_${columnIndex}`}
                        property={property}
                        value={entity.values[name]}
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
                        width: column.width,
                        height: column.height,
                        entity,
                        cellRect,
                        name,
                        schemaResolver
                    });
                }
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
                        name,
                        schemaResolver
                    });
                }
            };

            const selected = selectedCell?.columnIndex === columnIndex &&
                selectedCell?.entity.id === entity.id;

            const isFocused = selected && focused;

            const customFieldValidator: CustomFieldValidator | undefined = uniqueFieldValidator
                ? ({ name, value, property }) => uniqueFieldValidator({
                    name, value, property, entityId: entity.id
                })
: undefined;

            const validation = mapPropertyToYup({
                property,
                customFieldValidator,
                name: name
            });

            const onValueChange = onCellValueChange
                ? (props: OnCellChangeParams<any>) => onCellValueChange({
                    ...props,
                    entity
                })
                : undefined;

            return entity
                ? <PropertyTableCell
                    key={`table_cell_${name}_${rowIndex}_${columnIndex}`}
                    size={size}
                    align={column.align}
                    name={name as string}
                    validation={validation}
                    onValueChange={onValueChange}
                    selected={selected}
                    focused={isFocused}
                    setPreventOutsideClick={setPreventOutsideClick}
                    setFocused={setFocused}
                    value={entity?.values ? entity.values[name] : undefined}
                    property={property}
                    openPopup={openPopup}
                    select={onSelect}
                    width={column.width}
                    height={column.height}
                    entityId={entity.id}
                    entityValues={entity.values}/>
                : <SkeletonComponent property={property}
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

        const additionalColumn = additionalColumnsMap[column.dataKey as AdditionalKey];
        const value = additionalColumn.dependencies
            ? Object.entries(entity.values)
                .filter(([key, value]) => additionalColumn.dependencies!.includes(key as any))
                .reduce((a, b) => ({ ...a, ...b }), {})
            : undefined;

        return (
            <TableCell
                value={value}
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
                    {additionalColumn.builder({
                        entity,
                        context
                    })}
                </ErrorBoundary>
            </TableCell>
        );

    };

    const allColumns: TableColumn<M>[] = (Object.keys(resolvedSchema.properties) as (keyof M)[])
        .map((key) => {
            const property: Property<any> = resolvedSchema.properties[key];
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

    const columns = displayedProperties
        .map((p) => {
            return allColumns.find(c => c.key === p);
        }).filter(c => !!c) as TableColumn<M>[];

    const customFieldValidator: CustomFieldValidator | undefined = uniqueFieldValidator
        ? ({ name, value, property }) => uniqueFieldValidator({
            name,
            value,
            property,
            entityId: selectedCell?.entity.id
        })
        : undefined;

    const popupFormField = (
        <PopupFormField
            open={Boolean(popupCell)}
            onClose={onPopupClose}
            cellRect={popupCell?.cellRect}
            columnIndex={popupCell?.columnIndex}
            name={popupCell?.name}
            schemaResolver={popupCell?.schemaResolver}
            entity={popupCell?.entity}
            tableKey={tableKey.current}
            customFieldValidator={customFieldValidator}
            path={path}
            onCellValueChange={onCellValueChange}
            setPreventOutsideClick={setPreventOutsideClick}
        />
    );

    return { columns, popupFormField };

}
