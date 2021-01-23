import React, {
    MouseEvent,
    useCallback,
    useEffect,
    useMemo,
    useRef
} from "react";
import BaseTable, { Column } from "react-base-table";
import Measure, { ContentRect } from "react-measure";
import "react-base-table/styles.css";
import { Box, Button, Paper, useMediaQuery, useTheme } from "@material-ui/core";
import { Add, Delete } from "@material-ui/icons";

import {
    AdditionalColumnDelegate,
    CollectionSize,
    Entity,
    EntitySchema,
    FilterValues,
    Properties,
    Property
} from "../models";
import { fetchEntity, listenCollection } from "../models/firestore";
import { getCellAlignment, getPreviewWidth, getRowHeight } from "./common";
import { getIconForProperty } from "../util/property_icons";
import { CollectionTableToolbar } from "./CollectionTableToolbar";
import SkeletonComponent from "../preview/components/SkeletonComponent";
import ErrorBoundary from "../components/ErrorBoundary";
import DeleteEntityDialog from "./DeleteEntityDialog";
import TableCell from "./TableCell";
import PopupFormField from "./popup_field/PopupFormField";
import { OutsideAlerter } from "../util/OutsideAlerter";
import DisabledTableCell from "./DisabledTableCell";
import { PreviewComponent } from "../preview/PreviewComponent";
import { PreviewTableCell } from "./PreviewTableCell";
import { CollectionTableProps } from "./CollectionTableProps";
import { TableCellProps } from "./SelectedCellContext";
import { useHistory } from "react-router-dom";
import { CircularProgressCenter } from "../components";
import { useTableStyles } from "./styles";
import { CollectionRowActions } from "./CollectionRowActions";
import { getPreviewSizeFrom } from "../preview/util";

const PAGE_SIZE = 50;
const PIXEL_NEXT_PAGE_OFFSET = 1200;


interface CMSColumn {
    id: string;
    type: "property" | "additional";
    label: string;
    icon?: React.ReactNode;
    align: "right" | "left" | "center";
    sortable: boolean;
    width: number;
}

type Order = "asc" | "desc" | undefined;


export function CollectionTable<S extends EntitySchema<Key, P>,
    Key extends string = string,
    P extends Properties<Key> = Properties<Key>>({
                                                     includeToolbar,
                                                     initialFilter,
                                                     collectionPath,
                                                     schema,
                                                     paginationEnabled,
                                                     properties,
                                                     deleteEnabled = true,
                                                     editEnabled = true,
                                                     excludedProperties,
                                                     textSearchDelegate,
                                                     additionalColumns,
                                                     filterableProperties,
                                                     inlineEditing,
                                                     onNewClick,
                                                     extraActions,
                                                     title,
                                                     onSelection,
                                                     onEntityClick,
                                                     onEntityDelete,
                                                     onMultipleEntitiesDelete,
                                                     defaultSize = "m",
                                                     createFormField,
                                                     selectionEnabled = true
                                                 }: CollectionTableProps<S>) {

    const [data, setData] = React.useState<Entity<S>[]>([]);
    const [dataLoading, setDataLoading] = React.useState<boolean>(false);
    const [noMoreToLoad, setNoMoreToLoad] = React.useState<boolean>(false);
    const [dataLoadingError, setDataLoadingError] = React.useState<Error | undefined>();
    const [size, setSize] = React.useState<CollectionSize>(defaultSize);

    const [selectedItems, setSelectedItems] = React.useState<Entity<S>[]>([]);

    const [deleteEntityClicked, setDeleteEntityClicked] = React.useState<Entity<S> | Entity<S>[] | undefined>(undefined);

    const [textSearchInProgress, setTextSearchInProgress] = React.useState<boolean>(false);
    const [textSearchLoading, setTextSearchLoading] = React.useState<boolean>(false);
    const [textSearchData, setTextSearchData] = React.useState<Entity<S>[]>([]);

    const [filter, setFilter] = React.useState<FilterValues<S> | undefined>(initialFilter);
    const [currentOrder, setOrder] = React.useState<Order>();
    const [orderByProperty, setOrderProperty] = React.useState<string>();
    const [itemCount, setItemCount] = React.useState<number>(PAGE_SIZE);
    const [tableSize, setTableSize] = React.useState<ContentRect | undefined>();

    const [tableKey] = React.useState<string>(Math.random().toString(36));
    const tableRef = useRef<BaseTable>(null);

    const textSearchEnabled = !!textSearchDelegate;

    const currentData = textSearchInProgress ? textSearchData : data;
    const loading = textSearchInProgress ? textSearchLoading : dataLoading;
    const filterSet = filter && Object.keys(filter).length;

    const classes = useTableStyles({ size });

    const [selectedCell, setSelectedCell] = React.useState<TableCellProps>(undefined);
    const [focused, setFocused] = React.useState<boolean>(false);

    const [formPopupOpen, setFormPopupOpen] = React.useState<boolean>(false);
    const [preventOutsideClick, setPreventOutsideClick] = React.useState<boolean>(false);

    const clickableRows = (!editEnabled || !inlineEditing) && onEntityClick;

    const theme = useTheme();
    const largeLayout = useMediaQuery(theme.breakpoints.up("md"));

    function buildActions() {
        const addButton = editEnabled && onNewClick && (largeLayout ?
            <Button
                onClick={onNewClick}
                startIcon={<Add/>}
                size="large"
                variant="contained"
                color="primary">
                Add {schema.name}
            </Button>
            : <Button
                onClick={onNewClick}
                size="medium"
                variant="contained"
                color="primary"
            >
                <Add/>
            </Button>);

        const multipleDeleteButton = selectionEnabled && deleteEnabled &&
            <Button
                disabled={!(selectedItems?.length)}
                startIcon={<Delete/>}
                onClick={(event: MouseEvent) => {
                    event.stopPropagation();
                    setDeleteEntityClicked(selectedItems);
                }}
                color={"primary"}
            >
                <p style={{ minWidth: 24 }}>({selectedItems?.length})</p>
            </Button>;

        return (
            <>
                {multipleDeleteButton}
                {addButton}
            </>
        );
    }

    const actions = buildActions();

    const history = useHistory();
    history.listen(() => {
        setFormPopupOpen(false);
    });

    const select = useCallback((cell: TableCellProps) => {
        setSelectedCell(cell);
        setFocused(true);
        setFormPopupOpen(false);
    }, []);

    const unselect = useCallback(() => {
        setSelectedCell(undefined);
        setFocused(false);
        setFormPopupOpen(false);
        setPreventOutsideClick(false);
    }, []);

    const toggleEntitySelection = (entity: Entity<S>) => {
        let newValue;
        if (selectedItems.indexOf(entity) > -1) {
            newValue = selectedItems.filter((item: Entity<S>) => item !== entity);
        } else {
            newValue = [...selectedItems, entity];
        }
        setSelectedItems(newValue);
        if (onSelection)
            onSelection(collectionPath, newValue);
    };


    const additionalColumnsMap: Record<string, AdditionalColumnDelegate<S>> = useMemo(() => {
        return additionalColumns ?
            additionalColumns
                .map((aC) => ({ [aC.id]: aC }))
                .reduce((a, b) => ({ ...a, ...b }))
            : {};
    }, [additionalColumns]);

    const scrollToTop = () => {
        if (tableRef.current) {
            tableRef.current.scrollToTop(0);
        }
    };

    const handleClickOutside = () => {
        unselect();
    };

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

    const columns = useMemo(() => {
        const allColumns: CMSColumn[] = (Object.keys(schema.properties) as string[])
            .map((key) => {
                const property = schema.properties[key as string] as Property;
                return ({
                    id: key as string,
                    type: "property",
                    align: getCellAlignment(property),
                    icon: getIconForProperty(property, "disabled", "small"),
                    label: property.title || key as string,
                    sortable: true,
                    width: getPreviewWidth(property, size)
                });
            });

        if (additionalColumns) {
            const items: CMSColumn[] = additionalColumns.map((additionalColumn) =>
                ({
                    id: additionalColumn.id,
                    type: "additional",
                    align: "left",
                    sortable: false,
                    label: additionalColumn.title,
                    width: additionalColumn.width ? additionalColumn.width : 200
                }));
            allColumns.push(...items);
        }

        let result: CMSColumn[];
        if (properties) {
            result = properties
                .map((p) => {
                    return allColumns.find(c => c.id === p);
                }).filter(c => !!c) as CMSColumn[];
        } else if (excludedProperties) {
            result = allColumns
                .filter(c => !(excludedProperties as string[]).includes(c.id));
        } else {
            result = allColumns;
        }

        return result;

    }, [properties, excludedProperties]);

    useEffect(() => {

        setDataLoading(true);

        const cancelSubscription = listenCollection<S>(
            collectionPath,
            schema,
            entities => {
                setDataLoading(false);
                setDataLoadingError(undefined);
                setData(entities);
                setNoMoreToLoad(!paginationEnabled || entities.length < itemCount);
            },
            (error) => {
                console.error("ERROR", error);
                setDataLoading(false);
                setDataLoadingError(error);
            },
            filter,
            paginationEnabled ? itemCount : undefined,
            undefined,
            orderByProperty,
            currentOrder);

        return () => cancelSubscription();
    }, [collectionPath, schema, itemCount, currentOrder, orderByProperty, filter]);

    const onColumnSort = ({ key }: any) => {

        console.log("onColumnSort", key);
        const property = key;
        if (filter) {
            const filterKeys = Object.keys(filter);
            if (filterKeys.length > 1 || filterKeys[0] !== property) {
                return;
            }
        }
        resetPagination();

        const isDesc = orderByProperty === property && currentOrder === "desc";
        const isAsc = orderByProperty === property && currentOrder === "asc";
        setOrder(isDesc ? "asc" : (isAsc ? undefined : "desc"));
        setOrderProperty(isAsc ? undefined : property);

        scrollToTop();
    };


    async function onTextSearch(searchString?: string) {
        if (!!textSearchDelegate) {
            setTextSearchLoading(true);
            if (!searchString) {
                setTextSearchData([]);
                setTextSearchInProgress(false);
            } else {
                setTextSearchInProgress(true);
                const ids = await textSearchDelegate.performTextSearch(searchString);
                const promises: Promise<Entity<S>>[] = ids
                    .map((id) => fetchEntity(collectionPath, id, schema));
                const entities = await Promise.all(promises);
                setTextSearchData(entities);
            }
            setTextSearchLoading(false);
        }
    }


    const loadNextPage = () => {
        if (!paginationEnabled || dataLoading || noMoreToLoad)
            return;
        console.debug("collection loadNextPage", itemCount);
        setItemCount(itemCount + PAGE_SIZE);
    };

    const resetPagination = () => {
        setItemCount(PAGE_SIZE);
    };

    const resetSort = () => {
        setOrder(undefined);
        setOrderProperty(undefined);
    };

    const onFilterUpdate = (filterValues: FilterValues<S>) => {
        if (orderByProperty && filterValues) {
            const filterKeys = Object.keys(filterValues);
            if (filterKeys.length > 1 || filterKeys[0] !== orderByProperty) {
                resetSort();
            }
        }
        setFilter(filterValues);
    };

    const cellRenderer = ({
                              column,
                              columnIndex,
                              rowData,
                              rowIndex
                          }: any) => {

        const entity: Entity<S> = rowData;

        if (columnIndex === 0) {
            return buildTableRowButtons({
                rowIndex,
                entity
            });
        }

        const propertyKey = column.dataKey;
        const property = schema.properties[propertyKey];

        if (column.type === "property") {
            if (!editEnabled || !inlineEditing) {
                return (
                    <PreviewTableCell
                        key={`preview_cell_${propertyKey}_${rowIndex}_${columnIndex}`}
                        size={size}
                        align={column.align}>
                        <PreviewComponent
                            key={`table_preview_${entity.id}_${propertyKey}`}
                            name={`preview_${propertyKey}_${rowIndex}_${columnIndex}`}
                            value={entity.values[propertyKey]}
                            property={property}
                            size={getPreviewSizeFrom(size)}
                            entitySchema={schema}
                        />
                    </PreviewTableCell>
                );
            } else if (property.disabled || !editEnabled) {
                return (
                    <DisabledTableCell
                        key={`disabled_cell_${propertyKey}_${rowIndex}_${columnIndex}`}
                        size={size}
                        align={column.align}>
                        <PreviewComponent
                            key={`table_preview_${entity.id}_${propertyKey}`}
                            name={propertyKey}
                            value={entity.values[propertyKey]}
                            property={property}
                            size={getPreviewSizeFrom(size)}
                            entitySchema={schema}
                        />
                    </DisabledTableCell>
                );
            } else {

                const openPopup = () => {
                    setFormPopupOpen(true);
                };

                const onSelect = (cellRect: DOMRect) => {
                    select({
                        columnIndex,
                        rowIndex,
                        width: column.width,
                        height: column.height,
                        entity,
                        cellRect,
                        name: propertyKey,
                        property
                    });
                };

                const selected = selectedCell?.columnIndex === columnIndex
                    && selectedCell?.rowIndex === rowIndex;

                const isFocused = selected && focused;

                return entity ?
                    <TableCell
                        key={`table_cell_${propertyKey}_${rowIndex}_${columnIndex}`}
                        tableKey={tableKey}
                        size={size}
                        align={column.align}
                        name={propertyKey}
                        path={collectionPath}
                        entity={entity}
                        schema={schema}
                        selected={selected}
                        focused={isFocused}
                        setPreventOutsideClick={setPreventOutsideClick}
                        setFocused={setFocused}
                        value={entity.values[propertyKey]}
                        columnIndex={columnIndex}
                        rowIndex={rowIndex}
                        CollectionTable={CollectionTable}
                        property={property}
                        openPopup={openPopup}
                        select={onSelect}
                        createFormField={createFormField}/>
                    :
                    <SkeletonComponent property={property}
                                       size={getPreviewSizeFrom(size)}/>;
            }

        } else if (column.type === "additional") {
            return (
                <DisabledTableCell
                    size={size}
                    align={"left"}>
                    {additionalColumnsMap[column.dataKey].builder(entity)}
                </DisabledTableCell>
            );
        } else {
            return <Box>Internal ERROR</Box>;
        }
    };

    const buildTableRowButtons = ({ entity }: any) => {

        const isSelected = selectedItems.indexOf(entity) > -1;

        return (
            <CollectionRowActions
                entity={entity}
                isSelected={isSelected}
                collectionPath={collectionPath}
                editEnabled={editEnabled}
                deleteEnabled={deleteEnabled}
                selectionEnabled={selectionEnabled}
                size={size}
                toggleEntitySelection={toggleEntitySelection}
                onDeleteClicked={setDeleteEntityClicked}
            />
        );

    };

    const headerRenderer = ({ columnIndex }: any) => {

        const headCell = columns[columnIndex - 1];

        return (

            <ErrorBoundary>
                {columnIndex === 0 ?
                    <div className={classes.header}>
                        Id
                    </div>
                    :
                    <div className={classes.header}>
                        <div className={classes.headerItem}>
                            {headCell.icon}
                        </div>
                        <div className={classes.headerItem}>
                            {headCell.label}
                        </div>
                    </div>
                }
            </ErrorBoundary>
        );
    };

    function buildErrorView<S extends EntitySchema>() {
        return (

            <Paper className={classes.root}
                   style={{ height: "100%", width: "100%" }}>
                <Box display="flex"
                     justifyContent="center"
                     margin={6}>
                    {"Error fetching data from Firestore"}
                </Box>
            </Paper>
        );
    }

    function buildEmptyView<S extends EntitySchema>() {
        if (loading)
            return <CircularProgressCenter/>;
        return (
            <Box display="flex"
                 justifyContent="center"
                 margin={6}>
                {textSearchInProgress ? "No results" : (filterSet ? "No data with the selected filters" : "This collection is empty")}
            </Box>
        );
    }

    let body;

    if (!loading && dataLoadingError) {
        body = buildErrorView();
    } else {
        body =
            (
                <Measure
                    bounds
                    onResize={setTableSize}>
                    {({ measureRef }) => (
                        <div ref={measureRef}
                             className={classes.tableContainer}>

                            {tableSize?.bounds &&
                            <BaseTable
                                rowClassName={`${classes.tableRow} ${classes.tableRowClickable}`}
                                data={currentData}
                                width={tableSize.bounds.width}
                                height={tableSize.bounds.height}
                                emptyRenderer={buildEmptyView()}
                                fixed
                                ignoreFunctionInColumnCompare={false}
                                rowHeight={getRowHeight(size)}
                                ref={tableRef}
                                sortBy={currentOrder && orderByProperty ? {
                                    key: orderByProperty,
                                    order: currentOrder
                                } : undefined}
                                overscanRowCount={2}
                                onColumnSort={onColumnSort}
                                onEndReachedThreshold={PIXEL_NEXT_PAGE_OFFSET}
                                onEndReached={loadNextPage}
                                rowEventHandlers={
                                    clickableRows ?
                                        { onClick: ({ rowData }) => onEntityClick && onEntityClick(collectionPath, rowData as Entity<S>) }
                                        : undefined
                                }
                            >

                                <Column
                                    headerRenderer={headerRenderer}
                                    cellRenderer={cellRenderer}
                                    align={"center"}
                                    key={"header-id"}
                                    dataKey={"id"}
                                    flexShrink={0}
                                    frozen={"left"}
                                    width={160}/>

                                {columns.map((column) =>
                                    <Column
                                        key={column.id}
                                        type={column.type}
                                        title={column.label}
                                        className={classes.column}
                                        headerRenderer={headerRenderer}
                                        cellRenderer={cellRenderer}
                                        height={getRowHeight(size)}
                                        align={column.align}
                                        flexGrow={1}
                                        flexShrink={0}
                                        resizable={true}
                                        size={size}
                                        sortable={column.sortable}
                                        dataKey={column.id}
                                        width={column.width}/>)
                                }
                            </BaseTable>}
                        </div>
                    )}
                </Measure>

            );
    }


    const internalOnEntityDelete = (collectionPath: string, entity: Entity<S>) => {
        if (onEntityDelete)
            onEntityDelete(collectionPath, entity);
        setSelectedItems(selectedItems.filter((e) => e.id !== entity.id));
    };

    const internalOnMultipleEntitiesDelete = (collectionPath: string, entities: Entity<S>[]) => {
        if (onMultipleEntitiesDelete)
            onMultipleEntitiesDelete(collectionPath, entities);
        setSelectedItems([]);
    };

    return (
        <>

            <DeleteEntityDialog entityOrEntitiesToDelete={deleteEntityClicked}
                                collectionPath={collectionPath}
                                schema={schema}
                                open={!!deleteEntityClicked}
                                onEntityDelete={internalOnEntityDelete}
                                onMultipleEntitiesDelete={internalOnMultipleEntitiesDelete}
                                onClose={() => setDeleteEntityClicked(undefined)}/>

            <Paper className={classes.root}>

                {includeToolbar &&
                <CollectionTableToolbar schema={schema}
                                        filterValues={filter}
                                        onTextSearch={textSearchEnabled ? onTextSearch : undefined}
                                        collectionPath={collectionPath}
                                        filterableProperties={filterableProperties}
                                        actions={editEnabled && actions}
                                        extraActions={extraActions}
                                        size={size}
                                        onSizeChanged={setSize}
                                        title={title}
                                        loading={loading}
                                        onFilterUpdate={onFilterUpdate}/>}

                <PopupFormField
                    tableKey={tableKey}
                    schema={schema}
                    createFormField={createFormField}
                    cellRect={selectedCell?.cellRect}
                    formPopupOpen={formPopupOpen}
                    setFormPopupOpen={setFormPopupOpen}
                    rowIndex={selectedCell?.rowIndex}
                    name={selectedCell?.name}
                    property={selectedCell?.property}
                    setPreventOutsideClick={setPreventOutsideClick}
                    entity={selectedCell?.rowIndex != undefined ? data[selectedCell.rowIndex] : undefined}/>

                <OutsideAlerter enabled={!preventOutsideClick}
                                onOutsideClick={handleClickOutside}>
                    {body}
                </OutsideAlerter>

            </Paper>
        </>
    );

}
