import React, { useCallback, useEffect, useMemo, useRef } from "react";
import BaseTable, { Column } from "react-base-table";
import Measure, { ContentRect } from "react-measure";
import "react-base-table/styles.css";
import { Box, Paper, Typography } from "@material-ui/core";
import AssignmentIcon from "@material-ui/icons/Assignment";
import { useHistory } from "react-router-dom";

import {
    AdditionalColumnDelegate,
    buildPropertyFrom,
    CMSType,
    CollectionSize,
    CompositeIndex,
    Entity,
    EntitySchema,
    FilterValues,
    Property,
    WhereFilterOp
} from "../../models";
import {
    CMSColumn,
    getCellAlignment,
    getPropertyColumnWidth,
    getRowHeight,
    isPropertyFilterable,
    Sort
} from "../common";
import CollectionTableToolbar from "../internal/CollectionTableToolbar";
import PreviewComponent from "../../preview/PreviewComponent";
import SkeletonComponent from "../../preview/components/SkeletonComponent";
import ErrorBoundary from "../../core/internal/ErrorBoundary";
import TableCell from "../internal/TableCell";
import PopupFormField from "../internal/popup_field/PopupFormField";
import OutsideAlerter from "../../core/internal/OutsideAlerter";
import CollectionRowActions from "../internal/CollectionRowActions";
import { CollectionTableProps } from "./CollectionTableProps";
import { TableCellProps } from "../internal/TableCellProps";
import CircularProgressCenter from "../../core/internal/CircularProgressCenter";
import { useTableStyles } from "./styles";
import { getPreviewSizeFrom } from "../../preview/util";
import PropertyTableCell, { OnCellChangeParams } from "../internal/PropertyTableCell";
import { CustomFieldValidator, mapPropertyToYup } from "../../form/validation";
import { useCollectionFetch } from "../../hooks";
import { useTextSearch } from "../../hooks/useTextSearch";
import CollectionTableHeader from "../internal/CollectionTableHeader";

const DEFAULT_PAGE_SIZE = 50;

const PIXEL_NEXT_PAGE_OFFSET = 1200;


/**
 * This component is in charge of rendering a collection table with a high
 * degree of customization.
 *
 * Please note that you only need to use this component if you are building
 * a custom view. If you just need to create a default view you can do it
 * exclusively with config options.
 *
 * If you just want to bind a EntityCollection to a collection table you can
 * check {@link EntityCollectionTable}
 *
 * @see CollectionTableProps
 * @see EntityCollectionTable
 * @category Collection components
 */
export default function CollectionTable<S extends EntitySchema<Key>,
    Key extends string = Extract<keyof S["properties"], string>,
    AdditionalKey extends string = string>({
                                               initialFilter,
                                               initialSort,
                                               collectionPath,
                                               schema,
                                               displayedProperties,
                                               textSearchDelegate,
                                               additionalColumns,
                                               indexes,
                                               inlineEditing,
                                               toolbarActionsBuilder,
                                               title,
                                               tableRowActionsBuilder,
                                               defaultSize = "m",
                                               frozenIdColumn,
                                               uniqueFieldValidator,
                                               entitiesDisplayedFirst,
                                               paginationEnabled,
                                               onEntityClick,
                                               onCellValueChange,
                                               pageSize = DEFAULT_PAGE_SIZE
                                           }: CollectionTableProps<S, Key, AdditionalKey>) {


    const [size, setSize] = React.useState<CollectionSize>(defaultSize);

    const [itemCount, setItemCount] = React.useState<number | undefined>(paginationEnabled ? pageSize : undefined);

    const [filterValues, setFilterValues] = React.useState<FilterValues<Key>>(initialFilter || {});
    const [sortByProperty, setSortProperty] = React.useState<Key | undefined>(initialSort ? initialSort[0] : undefined);
    const [currentSort, setCurrentSort] = React.useState<Sort>(initialSort ? initialSort[1] : undefined);

    const [tableSize, setTableSize] = React.useState<ContentRect | undefined>();

    const [tableKey] = React.useState<string>(Math.random().toString(36));
    const tableRef = useRef<BaseTable>(null);

    const classes = useTableStyles();

    const [selectedCell, setSelectedCell] = React.useState<TableCellProps>(undefined);
    const [popupCell, setPopupCell] = React.useState<TableCellProps>(undefined);
    const [focused, setFocused] = React.useState<boolean>(false);

    const [formPopupOpen, setFormPopupOpen] = React.useState<boolean>(false);
    const [preventOutsideClick, setPreventOutsideClick] = React.useState<boolean>(false);

    const [searchString, setSearchString] = React.useState<string | undefined>();

    const textSearchEnabled = !!textSearchDelegate;

    const filterIsSet = filterValues && Object.keys(filterValues).length > 0;

    const {
        data,
        dataLoading,
        noMoreToLoad,
        dataLoadingError
    } = useCollectionFetch({
        entitiesDisplayedFirst,
        collectionPath,
        schema,
        filterValues,
        sortByProperty,
        currentSort,
        itemCount
    });

    const {
        textSearchData,
        textSearchLoading
    } = useTextSearch({
        searchString,
        textSearchDelegate,
        collectionPath,
        schema: schema as EntitySchema<any>
    });

    const textSearchInProgress = Boolean(searchString);

    const currentData: Entity<S, Key>[] = textSearchInProgress ? textSearchData : data;
    const loading = textSearchInProgress ? textSearchLoading : dataLoading;

    const actions = toolbarActionsBuilder && toolbarActionsBuilder({
        size,
        data: currentData
    });

    const history = useHistory();
    const updatePopup = (value: boolean) => {
        setFocused(!value);
        setFormPopupOpen(value);
    };

    history.listen(() => {
        setFormPopupOpen(false);
    });

    const loadNextPage = () => {
        if (!paginationEnabled || dataLoading || noMoreToLoad)
            return;
        if (itemCount !== undefined)
            setItemCount(itemCount + pageSize);
    };

    const resetPagination = () => {
        setItemCount(pageSize);
    };

    const select = (cell: TableCellProps) => {
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

    const additionalColumnsMap: Record<string, AdditionalColumnDelegate<string, S, Key>> = useMemo(() => {
        return additionalColumns ?
            additionalColumns
                .map((aC) => ({ [aC.id]: aC }))
                .reduce((a, b) => ({ ...a, ...b }), [])
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
        const allColumns: CMSColumn[] = (Object.keys(schema.properties) as Key[])
            .map((key) => {
                const property: Property<any> = buildPropertyFrom<any, S, Key>(schema.properties[key], schema.defaultValues ?? {}, collectionPath);
                return ({
                    id: key as string,
                    type: "property",
                    property,
                    align: getCellAlignment(property),
                    label: property.title || key as string,
                    sortable: true,
                    filterable: isPropertyFilterable(property),
                    width: getPropertyColumnWidth(property, size)
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
                    width: additionalColumn.width ?? 200
                }));
            allColumns.push(...items);
        }

        return displayedProperties
            .map((p) => {
                return allColumns.find(c => c.id === p);
            }).filter(c => !!c) as CMSColumn[];

    }, [displayedProperties]);


    const onColumnSort = (key: Key) => {

        const isDesc = sortByProperty === key && currentSort === "desc";
        const isAsc = sortByProperty === key && currentSort === "asc";
        const newSort = isDesc ? "asc" : (isAsc ? undefined : "desc");
        const newSortProperty = isAsc ? undefined : key;

        if (filterValues) {
            if (!isFilterCombinationValid(filterValues, indexes, newSortProperty, newSort)) {
                // reset filters
                setFilterValues({});
            }
        }
        resetPagination();

        setCurrentSort(newSort);
        setSortProperty(newSortProperty);

        scrollToTop();
    };

    const resetSort = () => {
        setCurrentSort(undefined);
        setSortProperty(undefined);
    };

    const clearFilter = () => setFilterValues({});

    const buildIdColumn = (props: {
        entity: Entity<S, Key>,
        size: CollectionSize,
    }) => {
        if (tableRowActionsBuilder)
            return tableRowActionsBuilder(props);
        else
            return <CollectionRowActions {...props}/>;

    };

    function checkInlineEditing(entity: Entity<any, any>) {
        if (typeof inlineEditing === "boolean") {
            return inlineEditing;
        } else if (typeof inlineEditing === "function") {
            return inlineEditing(entity);
        } else {
            return true;
        }
    }

    const onRowClick = ({ rowData }: any) => {
        const entity = rowData as Entity<S, Key>;
        if (checkInlineEditing(entity))
            return;
        return onEntityClick && onEntityClick(entity);
    };

    const cellRenderer = ({
                              column,
                              columnIndex,
                              rowData,
                              rowIndex
                          }: any) => {

        const entity: Entity<S, Key> = rowData;

        if (columnIndex === 0) {
            return buildIdColumn({
                size,
                entity
            });
        }

        if (column.type === "property") {

            const name = column.dataKey as Key;
            const propertyOrBuilder = schema.properties[name];
            const property: Property = buildPropertyFrom<CMSType, S, Key>(propertyOrBuilder, entity.values, entity.id);
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
                        name={name}
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

        } else if (column.type === "additional") {
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
                        {(additionalColumnsMap[column.dataKey as AdditionalKey]).builder(entity)}
                    </ErrorBoundary>
                </TableCell>
            );

        } else {
            return <Box>Internal ERROR</Box>;
        }
    };


    const headerRenderer = ({ columnIndex }: any) => {

        const column = columns[columnIndex - 1];

        const filterForThisProperty: [WhereFilterOp, any] | undefined =
            column && column.type === "property" && filterValues && filterValues[column.id] ?
                filterValues[column.id]
                : undefined;

        const onPropertyFilterUpdate = (filterForProperty?: [WhereFilterOp, any]) => {

            let newFilterValue = filterValues ? { ...filterValues } : {};

            if (!filterForProperty) {
                delete newFilterValue[column.id];
            } else {
                newFilterValue[column.id] = filterForProperty;
            }

            const isNewFilterCombinationValid = isFilterCombinationValid(newFilterValue, indexes, sortByProperty, currentSort);
            if (!isNewFilterCombinationValid) {
                newFilterValue = filterForProperty ? { [column.id]: filterForProperty } as FilterValues<Key> : {};
            }

            setFilterValues(newFilterValue);
            if (column.id !== sortByProperty) {
                resetSort();
            }
        };

        return (

            <ErrorBoundary>
                {columnIndex === 0 ?
                    <div className={classes.headerTypography}>
                        Id
                    </div>
                    :
                    <CollectionTableHeader
                        onFilterUpdate={onPropertyFilterUpdate}
                        filter={filterForThisProperty}
                        sort={sortByProperty === column.id ? currentSort : undefined}
                        onColumnSort={onColumnSort}
                        column={column}/>

                }
            </ErrorBoundary>
        );
    };

    function buildErrorView<S extends EntitySchema>() {
        return (

            <Paper className={classes.root}>
                <Box display="flex"
                     flexDirection={"column"}
                     justifyContent="center"
                     margin={6}>

                    <Typography variant={"h6"}>
                        {"Error fetching data from Firestore"}
                    </Typography>

                    {dataLoadingError?.name && <Typography>
                        {dataLoadingError?.name}
                    </Typography>}

                    {dataLoadingError?.message && <Typography>
                        {dataLoadingError?.message}
                    </Typography>}

                </Box>

            </Paper>
        );
    }

    function buildEmptyView<S extends EntitySchema>() {
        if (loading)
            return <CircularProgressCenter/>;
        return (
            <Box display="flex"
                 flexDirection={"column"}
                 alignItems="center"
                 justifyContent="center"
                 width={"100%"}
                 height={"100%"}
                 padding={2}>
                <Box padding={1}>
                    <AssignmentIcon/>
                </Box>
                <Typography>
                    {textSearchInProgress ? "No results" : (filterIsSet ? "No data with the selected filters" : "This collection is empty")}
                </Typography>
            </Box>
        );
    }

    const body =
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
                            emptyRenderer={dataLoadingError ? buildErrorView() : buildEmptyView()}
                            fixed
                            ignoreFunctionInColumnCompare={false}
                            rowHeight={getRowHeight(size)}
                            ref={tableRef}
                            overscanRowCount={2}
                            onEndReachedThreshold={PIXEL_NEXT_PAGE_OFFSET}
                            onEndReached={loadNextPage}
                            rowEventHandlers={
                                { onClick: onRowClick }
                            }
                        >

                            <Column
                                headerRenderer={headerRenderer}
                                cellRenderer={cellRenderer}
                                align={"center"}
                                key={"header-id"}
                                dataKey={"id"}
                                flexShrink={0}
                                frozen={frozenIdColumn ? "left" : undefined}
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
                                    dataKey={column.id}
                                    width={column.width}/>)
                            }
                        </BaseTable>}
                    </div>
                )}
            </Measure>

        );
    const customFieldValidator: CustomFieldValidator | undefined = uniqueFieldValidator
        ? ({ name, value, property }) => uniqueFieldValidator({
            name,
            value,
            property,
            entityId: selectedCell?.entity.id
        })
        : undefined;

    return (
        <>

            <Paper className={classes.root}>

                <CollectionTableToolbar schema={schema as EntitySchema}
                                        filterIsSet={filterIsSet}
                                        onTextSearch={textSearchEnabled ? setSearchString : undefined}
                                        clearFilter={clearFilter}
                                        actions={actions}
                                        size={size}
                                        onSizeChanged={setSize}
                                        title={title}
                                        loading={loading}/>

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
                    collectionPath={collectionPath}
                    formPopupOpen={formPopupOpen}
                    onCellValueChange={onCellValueChange}
                    setPreventOutsideClick={setPreventOutsideClick}
                    setFormPopupOpen={updatePopup}
                />

                <OutsideAlerter enabled={!preventOutsideClick}
                                onOutsideClick={handleClickOutside}>
                    {body}
                </OutsideAlerter>

            </Paper>
        </>
    );

}

function isFilterCombinationValid<Key extends string>(filterValues: FilterValues<Key>, indexes?: CompositeIndex<Key>[], sortKey?: Key, sortDirection?: "asc" | "desc"): boolean {

    // Order by clause cannot contain a field with an equality filter available
    const values: [WhereFilterOp, any][] = Object.values(filterValues);
    if (sortKey && values.map((v) => v[0]).includes("==")) {
        return false;
    }

    const filterKeys = Object.keys(filterValues);
    const filtersCount = filterKeys.length;
    if (!indexes && filtersCount > 1)
        return false;

    // only one filter set, different to the sort key
    if (sortKey && filtersCount === 1 && filterKeys[0] !== sortKey)
        return false;

    return !!indexes && indexes
        .filter((compositeIndex) => !sortKey || sortKey in compositeIndex)
        .find((compositeIndex) =>
            Object.entries(filterValues).every(([key, value]) => compositeIndex[key] !== undefined && (!sortDirection || compositeIndex[key] === sortDirection))
        ) !== undefined;
}
