import {
    CMSColumn,
    getCellAlignment,
    getPropertyColumnWidth,
    isPropertyFilterable
} from "../internal/common";
import {
    AdditionalColumnDelegate,
    CMSType,
    CollectionSize,
    Entity,
    EntitySchema,
    FireCMSContext,
    Property,
    PropertyOrBuilder
} from "../../models";
import { buildPropertyFrom } from "../../core/util/property_builder";
import React, { useCallback, useEffect, useMemo } from "react";
import TableCell from "../internal/TableCell";
import PreviewComponent from "../../preview/PreviewComponent";
import { getPreviewSizeFrom } from "../../preview/util";
import { CustomFieldValidator, mapPropertyToYup } from "../../form/validation";
import PropertyTableCell, { OnCellChangeParams } from "../internal/PropertyTableCell";
import SkeletonComponent from "../../preview/components/SkeletonComponent";
import { TableCellProps } from "../internal/TableCellProps";
import {
    OnCellValueChange,
    UniqueFieldValidator
} from "./CollectionTableProps";
import ErrorBoundary from "../../core/internal/ErrorBoundary";
import { useFireCMSContext } from "../../hooks";
import PopupFormField from "../internal/popup_field/PopupFormField";


export type ColumnsFromSchemaProps<M, AdditionalKey extends string> = {

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
    additionalColumns?: AdditionalColumnDelegate<M, AdditionalKey>[];

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


export function buildColumnsFromSchema<M, AdditionalKey extends string>({
                                                                            schema,
                                                                            additionalColumns,
                                                                            displayedProperties,
                                                                            path,
                                                                            inlineEditing,
                                                                            size,
                                                                            onCellValueChange,
                                                                            uniqueFieldValidator
                                                                        }: ColumnsFromSchemaProps<M, AdditionalKey>
): { cmsColumns: CMSColumn[], children: React.ReactElement, selectedCell: TableCellProps<M> } {


    const context: FireCMSContext = useFireCMSContext();

    const [selectedCell, setSelectedCell] = React.useState<TableCellProps<M>>(undefined);
    const [popupCell, setPopupCell] = React.useState<TableCellProps<M>>(undefined);
    const [focused, setFocused] = React.useState<boolean>(false);

    const [formPopupOpen, setFormPopupOpen] = React.useState<boolean>(false);
    const [preventOutsideClick, setPreventOutsideClick] = React.useState<boolean>(false);

    const [tableKey] = React.useState<string>(Math.random().toString(36));

    const additionalColumnsMap: Record<string, AdditionalColumnDelegate<M, string>> = useMemo(() => {
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

    const select = (cell: TableCellProps<M>) => {
        console.log("select", cell);
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


    function checkInlineEditing<M>(entity: Entity<M>) {
        if (typeof inlineEditing === "boolean") {
            return inlineEditing;
        } else if (typeof inlineEditing === "function") {
            return inlineEditing(entity);
        } else {
            return true;
        }
    }

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

        const name = column.dataKey as keyof M;
        const propertyOrBuilder: PropertyOrBuilder<any, M> = schema.properties[name];
        const property: Property<any> = buildPropertyFrom<CMSType, M>(propertyOrBuilder, entity.values, entity.id);
        const usedPropertyBuilder = typeof propertyOrBuilder === "function";

        const inlineEditingEnabled = checkInlineEditing(entity);

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
                        // rowIndex,
                        width: column.width,
                        height: column.height,
                        entity,
                        cellRect,
                        name: name,
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
                    const selectedConfig = {
                        columnIndex,
                        // rowIndex,
                        width: column.width,
                        height: column.height,
                        entity,
                        cellRect,
                        name: name,
                        property,
                        usedPropertyBuilder
                    };
                    select(selectedConfig);
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
                name
            });

            const onValueChange = onCellValueChange
                ? (props: OnCellChangeParams<any>) => onCellValueChange({
                    ...props,
                    entity
                })
                : undefined;

            return entity ?
                <PropertyTableCell
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

    const cmsColumns = useMemo(() => {
        const allColumns: CMSColumn[] = (Object.keys(schema.properties) as (keyof M)[])
            .map((key) => {
                const property: Property<any> = buildPropertyFrom<any, M>(schema.properties[key], schema.defaultValues ?? {}, path);
                return ({
                    id: key as string,
                    type: "property",
                    property,
                    align: getCellAlignment(property),
                    label: property.title || key as string,
                    sortable: true,
                    filterable: isPropertyFilterable(property),
                    width: getPropertyColumnWidth(property),
                    cellRenderer: propertyCellRenderer
                });
            });

        if (additionalColumns) {
            const items: CMSColumn[] = additionalColumns.map((additionalColumn) =>
                ({
                    id: additionalColumn.id,
                    type: "additional",
                    align: "left",
                    sortable: false,
                    filterable: false,
                    label: additionalColumn.title,
                    width: additionalColumn.width ?? 200,
                    cellRenderer: additionalCellRenderer
                }));
            allColumns.push(...items);
        }

        return displayedProperties
            .map((p) => {
                return allColumns.find(c => c.id === p);
            }).filter(c => !!c) as CMSColumn[];

    }, [displayedProperties, selectedCell]);


    const customFieldValidator: CustomFieldValidator | undefined = uniqueFieldValidator
        ? ({ name, value, property }) => uniqueFieldValidator({
            name,
            value,
            property,
            entityId: selectedCell?.entity.id
        })
        : undefined;

    const children = <>
        <PopupFormField
            cellRect={popupCell?.cellRect}
            columnIndex={popupCell?.columnIndex}
            name={popupCell?.name}
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

    return { selectedCell, cmsColumns, children };

}
