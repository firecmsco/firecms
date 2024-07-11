import React, { useCallback, useMemo, useRef } from "react";
import { AdditionalFieldDelegate, CollectionSize, Entity, FireCMSContext, User } from "../../types";
import { PropertyTableCell } from "./PropertyTableCell";
import { ErrorBoundary } from "../ErrorBoundary";
import { useFireCMSContext, useLargeLayout } from "../../hooks";
import { CellRendererParams, VirtualTableColumn } from "../VirtualTable";
import { getValueInPath } from "../../util";
import { EntityCollectionRowActions } from "./EntityCollectionRowActions";
import { CollectionTableToolbar } from "./internal/CollectionTableToolbar";
import { EntityCollectionTableProps } from "./EntityCollectionTableProps";
import { EntityTableCell } from "./internal/EntityTableCell";
import { CustomFieldValidator } from "../../form/validation";
import { renderSkeletonText } from "../../preview";
import { propertiesToColumns } from "./column_utils";
import { ErrorView } from "../ErrorView";
import { SelectableTable } from "../SelectableTable/SelectableTable";
import { cls } from "@firecms/ui";
import { getRowHeight } from "../common/table_height";

/**
 * This component is in charge of rendering a collection table with a high
 * degree of customization.
 *
 * This component is used internally by {@link EntityCollectionView} and
 * {@link useReferenceDialog}
 *
 * Please note that you only need to use this component if you are building
 * a custom view. If you just need to create a default view you can do it
 * exclusively with config options.
 *
 * If you want to bind a {@link EntityCollection} to a table with the default
 * options you see in collections in the top level navigation, you can
 * check {@link EntityCollectionView}.
 *
 * The data displayed in the table is managed by a {@link EntityTableController}.
 * You can build the default, bound to a path in the datasource, by using the hook
 * {@link useDataSourceEntityCollectionTableController}
 *
 * @see EntityCollectionTableProps
 * @see EntityCollectionView
 * @see VirtualTable
 * @group Components
 */
export const EntityCollectionTable = function EntityCollectionTable<M extends Record<string, any>, UserType extends User>
({
     className,
     style,
     forceFilter,
     actionsStart,
     actions,
     title,
     tableRowActionsBuilder,
     uniqueFieldValidator,
     getPropertyFor,
     onValueChange,
     selectionController,
     highlightedEntities,
     onEntityClick,
     onColumnResize,
     onSizeChanged,
     textSearchEnabled = false,
     hoverRow = true,
     inlineEditing = false,
     additionalFields,
     displayedColumnIds,
     defaultSize,
     properties,
     tableController,
     filterable = true,
     sortable = true,
     endAdornment,
     AddColumnComponent,
     AdditionalHeaderWidget,
     additionalIDHeaderWidget,
     emptyComponent,
     getIdColumnWidth,
     onTextSearchClick,
     textSearchLoading,
     enablePopupIcon
 }: EntityCollectionTableProps<M>) {

    const ref = useRef<HTMLDivElement>(null);

    const largeLayout = useLargeLayout();
    const selectedEntities = (selectionController?.selectedEntities?.length > 0 ? selectionController?.selectedEntities : highlightedEntities)?.filter(Boolean);

    const context: FireCMSContext<UserType> = useFireCMSContext();

    const [size, setSize] = React.useState<CollectionSize>(defaultSize ?? "m");

    const selectedEntityIds = selectedEntities?.map(e => e.id);

    const updateSize = useCallback((size: CollectionSize) => {
        if (onSizeChanged)
            onSizeChanged(size);
        setSize(size);
    }, []);

    const onTextSearch = useCallback((newSearchString?: string) => tableController.setSearchString?.(newSearchString), []);

    const additionalFieldsMap: Record<string, AdditionalFieldDelegate<M, UserType>> = useMemo(() => {
        return (additionalFields
            ? additionalFields
                .map((aC) => ({ [aC.key]: aC as AdditionalFieldDelegate<M, any> }))
                .reduce((a, b) => ({ ...a, ...b }), {})
            : {}) as Record<string, AdditionalFieldDelegate<M, UserType>>;
    }, [additionalFields]);

    const customFieldValidator: CustomFieldValidator | undefined = uniqueFieldValidator;

    const propertyCellRenderer = ({
                                      column,
                                      columnIndex,
                                      rowData,
                                      rowIndex
                                  }: CellRendererParams<any>) => {

        const entity: Entity<M> = rowData;

        const propertyKey = column.key;

        let disabled = column.custom?.disabled;
        const property = getPropertyFor?.({
            propertyKey,
            entity
        }) ?? column.custom.resolvedProperty;
        if (!property?.disabled) {
            disabled = false;
        }

        if (!property) {
            return null;
        }

        return (
            <ErrorBoundary>
                {entity
                    ? <PropertyTableCell
                        key={`property_table_cell_${entity.id}_${propertyKey}`}
                        readonly={!inlineEditing}
                        align={column.align ?? "left"}
                        propertyKey={propertyKey as string}
                        property={property}
                        value={entity?.values ? getValueInPath(entity.values, propertyKey) : undefined}
                        customFieldValidator={customFieldValidator}
                        columnIndex={columnIndex}
                        width={column.width}
                        height={getRowHeight(size)}
                        entity={entity}
                        disabled={disabled}
                        enablePopupIcon={enablePopupIcon}
                        path={entity.path}/>
                    : renderSkeletonText()
                }
            </ErrorBoundary>);

    };

    const additionalCellRenderer = useCallback(({
                                                    column,
                                                    rowData,
                                                    width
                                                }: CellRendererParams<any>) => {

        const entity: Entity<M> = rowData;

        const additionalField = additionalFieldsMap[column.key as string];
        const value = additionalField.dependencies
            ? Object.entries(entity.values)
                .filter(([key, value]) => additionalField.dependencies!.includes(key as Extract<keyof M, string>))
                .reduce((a, b) => ({ ...a, ...b }), {})
            : entity;

        const Builder = additionalField.Builder;
        if (!Builder && !additionalField.value) {
            throw new Error("When using additional fields you need to provide a Builder or a value");
        }

        const child = Builder
            ? <Builder entity={entity} context={context}/>
            : <>{additionalField.value?.({
                entity,
                context
            })}</>;

        return (
            <EntityTableCell
                key={`additional_table_cell_${entity.id}_${column.key}`}
                width={width}
                size={size}
                value={value}
                selected={false}
                disabled={true}
                align={"left"}
                allowScroll={false}
                showExpandIcon={false}
                disabledTooltip={"This column can't be edited directly"}
            >
                <ErrorBoundary>
                    {child}
                </ErrorBoundary>
            </EntityTableCell>
        );

    }, [size, selectedEntityIds]);

    const collectionColumns: VirtualTableColumn[] = (() => {
        const columnsResult: VirtualTableColumn[] = propertiesToColumns({
            properties,
            sortable,
            forceFilter,
            AdditionalHeaderWidget
        });

        const additionalTableColumns: VirtualTableColumn[] = additionalFields
            ? additionalFields.map((additionalField) =>
                ({
                    key: additionalField.key,
                    align: "left",
                    sortable: false,
                    title: additionalField.name,
                    width: additionalField.width ?? 200
                }))
            : [];
        return [...columnsResult, ...additionalTableColumns];
    })();

    const idColumn: VirtualTableColumn = {
        key: "id_ewcfedcswdf3",
        width: getIdColumnWidth?.() ?? (largeLayout ? 160 : 130),
        title: "ID",
        resizable: false,
        frozen: largeLayout,
        headerAlign: "center",
        align: "center",
        AdditionalHeaderWidget: () => additionalIDHeaderWidget
    }

    const columns: VirtualTableColumn[] = [
        idColumn,
        ...(displayedColumnIds
            ? displayedColumnIds
                .map((p) => {
                    return collectionColumns.find(c => c.key === p.key);
                }).filter(Boolean)
            : collectionColumns) as VirtualTableColumn[]
    ];

    const cellRenderer = useCallback((props: CellRendererParams<any>) => {
        const column = props.column;
        const columns = props.columns;
        const columnKey = column.key;

        try {
            if (props.columnIndex === 0) {
                if (tableRowActionsBuilder)
                    return tableRowActionsBuilder({
                        entity: props.rowData,
                        size,
                        width: column.width,
                        frozen: column.frozen
                    });
                else
                    return <EntityCollectionRowActions entity={props.rowData}
                                                       width={column.width}
                                                       frozen={column.frozen}
                                                       isSelected={false}
                                                       size={size}/>;
            } else if (additionalFieldsMap[columnKey]) {
                return additionalCellRenderer(props);
            } else if (props.columnIndex < columns.length + 1) {
                return propertyCellRenderer(props);
            } else {
                throw Error("Internal: columns not mapped properly");
            }
        } catch (e: any) {
            console.error("Error rendering cell", e);
            return <EntityTableCell
                size={size}
                width={column.width}
                saved={false}
                value={null}
                align={"left"}
                fullHeight={false}
                disabled={true}>
                <ErrorView error={e}/>
            </EntityTableCell>;
        }
    }, [tableRowActionsBuilder, additionalCellRenderer, propertyCellRenderer, size]);

    return (

        <div ref={ref}
             style={style}
             className={cls("h-full w-full flex flex-col bg-white dark:bg-gray-950", className)}>

            <CollectionTableToolbar
                onTextSearch={textSearchEnabled ? onTextSearch : undefined}
                textSearchLoading={textSearchLoading}
                onTextSearchClick={textSearchEnabled ? onTextSearchClick : undefined}
                size={size}
                onSizeChanged={updateSize}
                title={title}
                actionsStart={actionsStart}
                actions={actions}
                loading={tableController.dataLoading}/>

            <SelectableTable columns={columns}
                             size={size}
                             inlineEditing={inlineEditing}
                             cellRenderer={cellRenderer}
                             onEntityClick={onEntityClick}
                             highlightedRow={useCallback((entity: Entity<M>) => selectedEntityIds?.includes(entity.id) ?? false, [selectedEntityIds])}
                             tableController={tableController}
                             onValueChange={onValueChange}
                             onColumnResize={onColumnResize}
                             hoverRow={hoverRow}
                             filterable={filterable}
                             emptyComponent={emptyComponent}
                             endAdornment={endAdornment}
                             AddColumnComponent={AddColumnComponent}/>

        </div>
    );

};
