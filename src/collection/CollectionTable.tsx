import React, { MouseEvent, useEffect, useMemo, useRef } from "react";
import BaseTable, { AutoResizer, Column } from "react-base-table";
import "react-base-table/styles.css";

import {
    Box,
    createStyles,
    IconButton,
    makeStyles,
    Paper,
    Theme,
    Typography
} from "@material-ui/core";
import {
    AdditionalColumnDelegate,
    Entity,
    EntitySchema,
    FilterValues,
    Properties
} from "../models";
import { TextSearchDelegate } from "../text_search_delegate";
import { fetchEntity, listenCollection } from "../firebase";
import { getCellAlignment, getPreviewWidth } from "./common";
import { getIconForProperty, getIdIcon } from "../util/property_icons";
import { PreviewComponent } from "../preview";
import { CollectionTableToolbar } from "./CollectionTableToolbar";
import EditIcon from "@material-ui/icons/Edit";
import DeleteIcon from "@material-ui/icons/Delete";
import SkeletonComponent, { renderSkeletonText } from "../preview/SkeletonComponent";
import { ErrorBoundary } from "../components/ErrorBoundary";

const PAGE_SIZE = 50;
const PIXEL_NEXT_PAGE_OFFSET = 1200;

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            height: "100%",
            display: "flex",
            flexDirection: "column"
        },
        tableContainer: {
            width: "100%",
            height: "100%",
            flexGrow: 1
        },
        header: {
            display: "flex",
            flexDirection: "row",
            fontWeight: 500,
            lineHeight: "0.9rem",
            alignItems: "center",
            paddingLeft: theme.spacing(1),
            paddingRight: theme.spacing(1)
        },
        tableRow: {
            display: "flex",
            alignItems: "center",
            cursor: "pointer",
            fontSize: "0.875rem"
        },
        tableCell: {
            overflow: "auto",
            marginTop: "auto",
            marginBottom: "auto",
            width: "100%",
            padding: theme.spacing(1)
        },
        column: {
            overflow: "auto !important"
        }
    }));

interface CollectionTableProps<S extends EntitySchema,
    Key extends string = Extract<keyof S["properties"], string>,
    P extends Properties = Properties<Key>> {
    /**
     * Absolute collection path
     */
    collectionPath: string;

    /**
     * Schema of the entity displayed by this collection
     */
    schema: S;

    /**
     * Show the toolbar in this collection
     */
    includeToolbar: boolean,

    /**
     * Override the title in the toolbar
     */
    overrideTitle?: string,

    /**
     * In case this table should have some filters set by default
     */
    initialFilter?: FilterValues<S>;

    /**
     * Is pagination enabled in the bottom of the table
     */
    paginationEnabled: boolean,

    /**
     * Should the table be rendered in small format
     */
    small: boolean,

    /**
     * If a text search delegate is provided, a searchbar is displayed
     */
    textSearchDelegate?: TextSearchDelegate,

    /**
     * Properties displayed in this collection. If this property is not set
     * every property is displayed
     */
    properties?: Key[];

    /**
     * Properties that should NOT get displayed in the collection view.
     * All the other properties from the the entity are displayed
     * It has no effect if the properties value is set.
     */
    excludedProperties?: Key[];

    /**
     * You can add additional columns to the collection view by implementing
     * an additional column delegate.
     */
    additionalColumns?: AdditionalColumnDelegate<S>[];

    /**
     * Properties that can be filtered
     */
    filterableProperties?: (keyof S["properties"])[];

    /**
     * Widget to display in the upper bar
     */
    actions?: React.ReactChild;

    /**
     * Should the table add an edit button
     */
    onEntityEdit?(collectionPath: string, entity: Entity<S>): void;

    /**
     * Callback when anywhere on the table is clicked
     */
    onEntityClick?(collectionPath: string, entity: Entity<S>): void;

    /**
     * Callback when the delete button of an entity is clicked
     */
    onEntityDelete?(collectionPath: string, entity: Entity<S>): void;

}

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
                                                     onEntityClick,
                                                     onEntityDelete,
                                                     onEntityEdit,
                                                     properties,
                                                     excludedProperties,
                                                     textSearchDelegate,
                                                     additionalColumns,
                                                     filterableProperties,
                                                     overrideTitle,
                                                     actions,
                                                     small
                                                 }: CollectionTableProps<S>) {

    const classes = useStyles();

    const [data, setData] = React.useState<Entity<S>[]>([]);
    const [dataLoading, setDataLoading] = React.useState<boolean>(false);
    const [noMoreToLoad, setNoMoreToLoad] = React.useState<boolean>(false);
    const [dataLoadingError, setDataLoadingError] = React.useState<Error | undefined>();

    const [textSearchInProgress, setTextSearchInProgress] = React.useState<boolean>(false);
    const [textSearchLoading, setTextSearchLoading] = React.useState<boolean>(false);
    const [textSearchData, setTextSearchData] = React.useState<Entity<S>[]>([]);

    const [filter, setFilter] = React.useState<FilterValues<S> | undefined>(initialFilter);
    const [currentOrder, setOrder] = React.useState<Order>();
    const [orderByProperty, setOrderProperty] = React.useState<string>();
    const [itemCount, setItemCount] = React.useState<number>(PAGE_SIZE);

    const tableRef = useRef<BaseTable>(null);
    const [scroll, setScroll] = React.useState<number>(0);
    const scrollToTop = () => {
        setScroll(0);
        if(tableRef.current) {
            tableRef.current.scrollToTop(0);
        }
    }

    const additionalColumnsMap: Record<string, AdditionalColumnDelegate<S>> = useMemo(() => {
        return additionalColumns ?
            additionalColumns
                .map((aC) => ({ [aC.id]: aC }))
                .reduce((a, b) => ({ ...a, ...b }))
            : {};
    }, [additionalColumns]);

    const columns = useMemo(() => {
        const allColumns: CMSColumn[] = (Object.keys(schema.properties) as string[])
            .map((key, index) => {
                const property = schema.properties[key as string];
                return ({
                    id: key as string,
                    type: "property",
                    align: getCellAlignment(property),
                    icon: getIconForProperty(property, "disabled", "small"),
                    label: property.title || key as string,
                    sortable: true,
                    width: getPreviewWidth(property, small)
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


    const currentData = textSearchInProgress ? textSearchData : data;
    const loading = textSearchInProgress ? textSearchLoading : dataLoading;
    const filterSet = filter && Object.keys(filter).length;

    useEffect(() => {

        setDataLoading(true);

        const cancelSubscription = listenCollection<S>(
            collectionPath,
            schema,
            entities => {
                setDataLoading(false);
                setDataLoadingError(undefined);
                setData(entities);
                setNoMoreToLoad(entities.length < itemCount);
            },
            (error) => {
                console.error("ERROR", error);
                setDataLoading(false);
                setDataLoadingError(error);
            },
            filter,
            itemCount,
            undefined,
            orderByProperty,
            currentOrder);

        return () => cancelSubscription();
    }, [collectionPath, schema, itemCount, currentOrder, orderByProperty, filter]);

    const onColumnSort = ({ key, order }: any) => {

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

    const onScroll = ({
                          scrollTop
                      }: {
        scrollLeft: number;
        scrollTop: number;
        horizontalScrollDirection: "forward" | "backward";
        verticalScrollDirection: "forward" | "backward";
        scrollUpdateWasRequested: boolean;
    }) => {
        setScroll(scrollTop);
    };

    const textSearchEnabled = !!textSearchDelegate;

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

    const editEnabled = !!onEntityEdit;
    const deleteEnabled = !!onEntityDelete;

    const loadNextPage = () => {
        if (dataLoading || noMoreToLoad)
            return;
        console.log("loadNextPage", itemCount);
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
                              cellData,
                              columns,
                              column,
                              columnIndex,
                              rowData,
                              rowIndex,
                              container,
                              isScrolling
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

        if (column.type === "property")
            return (
                <Box className={classes.tableCell}>
                    {entity ?
                        <ErrorBoundary>
                            <PreviewComponent name={propertyKey}
                                              value={entity.values[propertyKey]}
                                              property={property}
                                              size={"small"}
                                              entitySchema={schema}/>
                        </ErrorBoundary>
                        :
                        <SkeletonComponent property={property}
                                           size={"small"}/>}

                </Box>
            );
        else if (column.type === "additional")
            return (
                <ErrorBoundary>
                    <Box className={classes.tableCell}>
                        {additionalColumnsMap[column.dataKey].builder(entity)}
                    </Box>
                </ErrorBoundary>
            );
        else
            return <Box>Internal ERROR</Box>;
    };

    const buildTableRowButtons = ({ entity }: any) => {

        return (
            <ErrorBoundary>
                <Box>

                    {(editEnabled || deleteEnabled) &&
                    <Box minWidth={96}>
                        {editEnabled &&
                        <IconButton
                            onClick={(event: MouseEvent) => {
                                event.stopPropagation();
                                if (onEntityEdit)
                                    onEntityEdit(collectionPath, entity);
                            }}
                        >
                            <EditIcon/>
                        </IconButton>
                        }

                        {deleteEnabled && <IconButton
                            onClick={(event: MouseEvent) => {
                                event.stopPropagation();
                                if (onEntityDelete)
                                    onEntityDelete(collectionPath, entity);
                            }}>
                            <DeleteIcon/>
                        </IconButton>}
                    </Box>}

                    <Box width={96}
                         component="div"
                         textAlign="center"
                         textOverflow="ellipsis"
                         overflow="hidden">

                        {entity ?
                            <Typography
                                variant={"caption"}
                                color={"textSecondary"}> {entity.id} </Typography>
                            :
                            renderSkeletonText()
                        }
                    </Box>

                </Box>
            </ErrorBoundary>
        );
    };

    const headerRenderer = ({ columnIndex }: any) => {

        const headCell = columns[columnIndex - 1];

        return (

            <ErrorBoundary>
                {columnIndex === 0 ?
                    <Box className={classes.header}>
                        <Box display={"inherit"}
                             paddingRight={"10px"}>
                            {getIdIcon("disabled", "small")}
                        </Box>
                        <Box display={"inherit"}
                             paddingRight={"10px"}>
                            Id
                        </Box>
                    </Box>
                    :
                    <Box className={classes.header}>
                        <Box display={"inherit"}
                             paddingRight={"10px"}>
                            {headCell.icon}
                        </Box>
                        <Box display={"inherit"}
                             paddingRight={"10px"}>
                            {headCell.label}
                        </Box>
                    </Box>
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
        return (
            <Paper className={classes.root}
                   style={{ height: "100%", width: "100%" }}>
                <Box display="flex"
                     justifyContent="center"
                     margin={6}>
                    {filterSet ? "No data with the selected filters" : "This collection is empty"}
                </Box>
            </Paper>
        );
    }

    let body;

    if (!loading) {
        if (dataLoadingError)
            body = buildErrorView();
        else if (!textSearchInProgress && !data?.length)
            body = buildEmptyView();
    }

    if (!body) {
        body = <AutoResizer>
            {({ width, height }) => (
                <BaseTable
                    rowClassName={classes.tableRow}
                    data={currentData}
                    width={width}
                    height={height}
                    fixed
                    rowHeight={140}
                    ref={tableRef}
                    sortBy={currentOrder && orderByProperty ? {
                        key: orderByProperty,
                        order: currentOrder
                    } : undefined}
                    overscanRowCount={4}
                    onColumnSort={onColumnSort}
                    onScroll={onScroll}
                    onEndReachedThreshold={PIXEL_NEXT_PAGE_OFFSET}
                    onEndReached={loadNextPage}
                    rowEventHandlers={{ onClick: ({ rowData }) => onEntityClick && onEntityClick(collectionPath, rowData as Entity<S>) }}>

                    <Column headerRenderer={headerRenderer}
                            cellRenderer={cellRenderer}
                            align={"center"}
                            key={"header-id"}
                            dataKey={"id"}
                            flexShrink={0}
                            frozen={"left"}
                            width={130}/>

                    {columns.map((column) =>
                        <Column key={column.id}
                                type={column.type}
                                title={column.label}
                                className={classes.column}
                                headerRenderer={headerRenderer}
                                cellRenderer={cellRenderer}
                                align={column.align}
                                flexGrow={1}
                                flexShrink={0}
                                resizable={true}
                                sortable={column.sortable}
                                dataKey={column.id}
                                width={column.width}/>)
                    }
                </BaseTable>)
            }
        </AutoResizer>;
    }

    return (
        <Paper className={classes.root}
               style={{ height: "100%", width: "100%" }}>

            {includeToolbar &&
            <CollectionTableToolbar schema={schema}
                                    filterValues={filter}
                                    onTextSearch={textSearchEnabled ? onTextSearch : undefined}
                                    collectionPath={collectionPath}
                                    filterableProperties={filterableProperties}
                                    actions={actions}
                                    overrideTitle={overrideTitle}
                                    loading={loading}
                                    onFilterUpdate={onFilterUpdate}/>}

            <div className={classes.tableContainer}>
                <ErrorBoundary>
                    {body}
                </ErrorBoundary>
            </div>
        </Paper>
    );

}
