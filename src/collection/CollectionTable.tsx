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
    CollectionSize,
    Entity,
    EntitySchema,
    FilterValues,
    Properties
} from "../models";
import { TextSearchDelegate } from "../text_search_delegate";
import { fetchEntity, listenCollection } from "../firebase";
import { getCellAlignment, getPreviewWidth, getRowHeight } from "./common";
import { getIconForProperty } from "../util/property_icons";
import { PreviewComponent } from "../preview";
import { CollectionTableToolbar } from "./CollectionTableToolbar";
import DeleteIcon from "@material-ui/icons/Delete";
import KeyboardTabIcon from "@material-ui/icons/KeyboardTab";
import SkeletonComponent, { renderSkeletonText } from "../preview/SkeletonComponent";
import ErrorBoundary from "../components/ErrorBoundary";
import { getPreviewSizeFrom } from "../preview/PreviewComponentProps";
import DeleteEntityDialog from "./DeleteEntityDialog";
import { useSelectedEntityContext } from "../SelectedEntityContext";

const PAGE_SIZE = 50;
const PIXEL_NEXT_PAGE_OFFSET = 1200;

export interface StyleProps {
    size: CollectionSize;
}

const useStyles = makeStyles<Theme, StyleProps>((theme: Theme) =>
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
            fontSize: "0.875rem"
        },
        clickableTableRow: {
            cursor: "pointer"
        },
        tableCell: {
            overflow: "auto",
            marginTop: "auto",
            marginBottom: "auto",
            width: "100%",
            padding: ({ size }) => {
                switch (size) {
                    case "xs":
                        return theme.spacing(0);
                    case "l":
                    case "xl":
                        return theme.spacing(2);
                    default:
                        return theme.spacing(1);
                }
            }
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
    title?: React.ReactNode;

    /**
     * In case this table should have some filters set by default
     */
    initialFilter?: FilterValues<S>;

    /**
     * If enabled, content is loaded in batch
     */
    paginationEnabled: boolean,

    /**
     * Default table size before being changed with the selector
     */
    defaultSize?: CollectionSize,

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
    actions?: React.ReactNode;

    /**
     * Should the table add an edit button
     */
    editEnabled?: boolean;

    /**
     * Should the table add a delete button
     */
    deleteEnabled?: boolean;

    /**
     * Callback when anywhere on the table is clicked
     */
    onEntityClick?(collectionPath: string, entity: Entity<S>): void;

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
                                                     paginationEnabled,
                                                     properties,
                                                     deleteEnabled,
                                                     editEnabled,
                                                     excludedProperties,
                                                     textSearchDelegate,
                                                     additionalColumns,
                                                     filterableProperties,
                                                     title,
                                                     actions,
                                                     defaultSize = "m"
                                                 }: CollectionTableProps<S>) {


    const [data, setData] = React.useState<Entity<S>[]>([]);
    const [dataLoading, setDataLoading] = React.useState<boolean>(false);
    const [noMoreToLoad, setNoMoreToLoad] = React.useState<boolean>(false);
    const [dataLoadingError, setDataLoadingError] = React.useState<Error | undefined>();
    const [size, setSize] = React.useState<CollectionSize>(defaultSize);

    const [deleteEntityClicked, setDeleteEntityClicked] = React.useState<Entity<S> | undefined>(undefined);

    const [textSearchInProgress, setTextSearchInProgress] = React.useState<boolean>(false);
    const [textSearchLoading, setTextSearchLoading] = React.useState<boolean>(false);
    const [textSearchData, setTextSearchData] = React.useState<Entity<S>[]>([]);

    const [filter, setFilter] = React.useState<FilterValues<S> | undefined>(initialFilter);
    const [currentOrder, setOrder] = React.useState<Order>();
    const [orderByProperty, setOrderProperty] = React.useState<string>();
    const [itemCount, setItemCount] = React.useState<number>(PAGE_SIZE);

    const tableRef = useRef<BaseTable>(null);
    const scrollToTop = () => {
        if (tableRef.current) {
            tableRef.current.scrollToTop(0);
        }
    };

    const selectedEntityContext = useSelectedEntityContext();
    const classes = useStyles({ size });

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
                                              size={getPreviewSizeFrom(size)}
                                              entitySchema={schema}/>
                        </ErrorBoundary>
                        :
                        <SkeletonComponent property={property}
                                           size={getPreviewSizeFrom(size)}/>}

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
                                selectedEntityContext.open({
                                    entityId: entity.id,
                                    collectionPath
                                });
                            }}
                        >
                            <KeyboardTabIcon/>
                        </IconButton>
                        }

                        {deleteEnabled && <IconButton
                            onClick={(event: MouseEvent) => {
                                event.stopPropagation();
                                setDeleteEntityClicked(entity);
                            }}>
                            <DeleteIcon/>
                        </IconButton>}
                    </Box>}

                    {size !== "xs" && <Box width={96}
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
                    </Box>}

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
                        Id
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
                    rowClassName={`${classes.tableRow} ${onEntityClick ? classes.clickableTableRow : ""}`}
                    data={currentData}
                    width={width}
                    height={height}
                    fixed
                    rowHeight={getRowHeight(size)}
                    ref={tableRef}
                    sortBy={currentOrder && orderByProperty ? {
                        key: orderByProperty,
                        order: currentOrder
                    } : undefined}
                    overscanRowCount={4}
                    onColumnSort={onColumnSort}
                    onEndReachedThreshold={PIXEL_NEXT_PAGE_OFFSET}
                    onEndReached={loadNextPage}
                    rowEventHandlers={onEntityClick ? { onClick: ({ rowData }) => onEntityClick && onEntityClick(collectionPath, rowData as Entity<S>) } : undefined}>

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
                                size={size}
                                sortable={column.sortable}
                                dataKey={column.id}
                                width={column.width}/>)
                    }
                </BaseTable>)
            }
        </AutoResizer>;
    }

    return (
        <React.Fragment>

            <DeleteEntityDialog entity={deleteEntityClicked}
                                schema={schema}
                                open={!!deleteEntityClicked}
                                onClose={() => setDeleteEntityClicked(undefined)}/>

            <Paper className={classes.root}
                   style={{ height: "100%", width: "100%" }}>

                {includeToolbar &&
                <CollectionTableToolbar schema={schema}
                                        filterValues={filter}
                                        onTextSearch={textSearchEnabled ? onTextSearch : undefined}
                                        collectionPath={collectionPath}
                                        filterableProperties={filterableProperties}
                                        actions={actions}
                                        size={size}
                                        onSizeChanged={setSize}
                                        title={title}
                                        loading={loading}
                                        onFilterUpdate={onFilterUpdate}/>}

                <div className={classes.tableContainer}>
                    {body}
                </div>

            </Paper>
        </React.Fragment>
    );

}
