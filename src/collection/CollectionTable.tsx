import React, { useCallback, useEffect, useMemo, useRef } from "react";
import BaseTable, { Column } from "react-base-table";
import Measure, { ContentRect } from "react-measure";
import "react-base-table/styles.css";
import { Box, Paper, Typography } from "@material-ui/core";
import {
    AdditionalColumnDelegate,
    buildPropertyFrom,
    CollectionSize,
    Entity,
    EntitySchema,
    FilterValues,
    Property
} from "../models";
import {
    getCellAlignment,
    getPropertyColumnWidth,
    getRowHeight
} from "./common";
import { getIconForProperty } from "../util/property_icons";
import { CollectionTableToolbar } from "./CollectionTableToolbar";
import { PreviewComponent, SkeletonComponent } from "../preview";
import { ErrorBoundary } from "../components";
import TableCell from "./TableCell";
import PopupFormField from "./popup_field/PopupFormField";
import { OutsideAlerter } from "../util/OutsideAlerter";
import { CollectionTableProps } from "./CollectionTableProps";
import { TableCellProps } from "./SelectedCellContext";
import { useHistory } from "react-router-dom";
import CircularProgressCenter from "../components/CircularProgressCenter";
import { useTableStyles } from "./styles";
import { getPreviewSizeFrom } from "../preview/util";
import { CollectionRowActions } from "./CollectionRowActions";
import AssignmentIcon from "@material-ui/icons/Assignment";
import PropertyTableCell, { OnCellChangeParams } from "./PropertyTableCell";
import { CustomFieldValidator, mapPropertyToYup } from "../form/validation";
import { useCollectionFetch } from "../hooks/useCollectionFetch";
import { useTextSearch } from "../hooks/useTextSearch";
import { useTranslation } from "react-i18next";

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


export default function CollectionTable<S extends EntitySchema<Key>,
    Key extends string,
    AdditionalKey extends string = string>({
                                               initialFilter,
                                               initialSort,
                                               collectionPath,
                                               schema,
                                               displayedProperties,
                                               textSearchDelegate,
                                               additionalColumns,
                                               filterableProperties,
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
                                               onCellValueChange
                                           }: CollectionTableProps<S, Key, AdditionalKey>) {



    const [size, setSize] = React.useState<CollectionSize>(defaultSize);

    const [itemCount, setItemCount] = React.useState<number | undefined>(paginationEnabled ? PAGE_SIZE : undefined);

    const [filter, setFilter] = React.useState<FilterValues<S, Key> | undefined>(initialFilter);
    const [currentSort, setSort] = React.useState<Order>(initialSort ? initialSort[1] : undefined);
    const [sortByProperty, setSortProperty] = React.useState<string | undefined>(initialSort ? initialSort[0] as string : undefined);

    const [tableSize, setTableSize] = React.useState<ContentRect | undefined>();

    const [tableKey] = React.useState<string>(Math.random().toString(36));
    const tableRef = useRef<BaseTable>(null);

    const { t } = useTranslation();
    const classes = useTableStyles({ size });

    const [selectedCell, setSelectedCell] = React.useState<TableCellProps>(undefined);
    const [focused, setFocused] = React.useState<boolean>(false);

    const [formPopupOpen, setFormPopupOpen] = React.useState<boolean>(false);
    const [preventOutsideClick, setPreventOutsideClick] = React.useState<boolean>(false);

    const [searchString, setSearchString] = React.useState<string | undefined>();

    const textSearchEnabled = !!textSearchDelegate;

    const filterSet = filter && Object.keys(filter).length;

    const {
        data,
        dataLoading,
        noMoreToLoad,
        dataLoadingError
    } = useCollectionFetch({
        entitiesDisplayedFirst,
        collectionPath,
        schema,
        filter,
        sortByProperty,
        currentSort,
        itemCount
    });

    const {
        textSearchData,
        textSearchLoading,
    } = useTextSearch({
        searchString,
        textSearchDelegate,
        collectionPath,
        schema,
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
            setItemCount(itemCount + PAGE_SIZE);
    };

    const resetPagination = () => {
        setItemCount(PAGE_SIZE);
    };

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
                const property: Property = buildPropertyFrom<S, Key, any>(schema.properties[key], schema.defaultValues ?? {});
                return ({
                    id: key as string,
                    type: "property",
                    align: getCellAlignment(property),
                    icon: getIconForProperty(property, "disabled", "small"),
                    label: property.title || key as string,
                    sortable: true,
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


    const onColumnSort = ({ key }: any) => {

        console.debug("onColumnSort", key);
        const property = key;
        if (filter) {
            const filterKeys = Object.keys(filter);
            if (filterKeys.length > 1 || filterKeys[0] !== property) {
                return;
            }
        }
        resetPagination();

        const isDesc = sortByProperty === property && currentSort === "desc";
        const isAsc = sortByProperty === property && currentSort === "asc";
        setSort(isDesc ? "asc" : (isAsc ? undefined : "desc"));
        setSortProperty(isAsc ? undefined : property);

        scrollToTop();
    };

    const resetSort = () => {
        setSort(undefined);
        setSortProperty(undefined);
    };

    const onFilterUpdate = (filterValues: FilterValues<S, Key>) => {
        if (sortByProperty && filterValues) {
            const filterKeys = Object.keys(filterValues);
            if (filterKeys.length > 1 || filterKeys[0] !== sortByProperty) {
                resetSort();
            }
        }
        setFilter(filterValues);
    };

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
            const property = buildPropertyFrom<S, Key>(propertyOrBuilder, entity.values, entity.id);
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

                const openPopup = () => {
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
                            name: name,
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
                    disabledTooltip={t("errorAdditionalColumnsCantBeEdited")}
                >
                    <ErrorBoundary>
                        {(additionalColumnsMap[column.dataKey as AdditionalKey]).builder(entity)}
                    </ErrorBoundary>
                </TableCell>
            );

        } else {
            return <Box>{t("errorInternal")}</Box>;
        }
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

            <Paper className={classes.root}>
                <Box display="flex"
                     flexDirection={"column"}
                     justifyContent="center"
                     margin={6}>

                    <Typography variant={"h6"}>
                        {t("errorFetchingData")}
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
                    {textSearchInProgress ? t("searchNoResults") : (filterSet ? t("searchNoDataWithSelectedFilters") : t("searchCollectionIsEmpty"))}
                </Typography>
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
                                sortBy={currentSort && sortByProperty ? {
                                    key: sortByProperty,
                                    order: currentSort
                                } : undefined}
                                overscanRowCount={2}
                                onColumnSort={onColumnSort}
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

                <CollectionTableToolbar schema={schema}
                                        filterValues={filter}
                                        onTextSearch={textSearchEnabled ? setSearchString : undefined}
                                        filterableProperties={filterableProperties}
                                        actions={actions}
                                        size={size}
                                        onSizeChanged={setSize}
                                        title={title}
                                        loading={loading}
                                        onFilterUpdate={onFilterUpdate}/>

                <PopupFormField
                    cellRect={selectedCell?.cellRect}
                    columnIndex={selectedCell?.columnIndex}
                    name={selectedCell?.name}
                    property={selectedCell?.property}
                    usedPropertyBuilder={selectedCell?.usedPropertyBuilder ?? false}
                    entity={selectedCell?.entity}
                    tableKey={tableKey}
                    customFieldValidator={customFieldValidator}
                    schema={schema}
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

export { CollectionTable } ;
