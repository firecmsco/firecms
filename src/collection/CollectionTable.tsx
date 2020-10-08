import React, { useEffect, useRef } from "react";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableRow from "@material-ui/core/TableRow";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import Paper from "@material-ui/core/Paper";

import {
    Box,
    createStyles,
    Grid,
    Hidden,
    IconButton,
    makeStyles,
    TableContainer,
    Theme
} from "@material-ui/core";
import DeleteIcon from "@material-ui/icons/Delete";
import EditIcon from "@material-ui/icons/Edit";
import {
    AdditionalColumnDelegate,
    Entity,
    EntitySchema,
    FilterValues,
    Property
} from "../models";
import { fetchEntity, listenCollection } from "../firebase";
import FilterPopup from "./FilterPopup";
import { TextSearchDelegate } from "../text_search_delegate";
import SearchBar from "./SearchBar";
import PreviewComponent from "../preview/PreviewComponent";
import SkeletonComponent, { renderSkeletonText } from "../preview/SkeletonComponent";
import { lighten } from "@material-ui/core/styles";
import { CollectionTableHead } from "./CollectionTableHead";
import { getCellAlignment } from "./common";

const PAGE_SIZE = 100;
const PIXEL_NEXT_PAGE_OFFSET = 600;

export const collectionStyles = makeStyles((theme: Theme) =>
    createStyles({
        toolbar: {
            paddingLeft: theme.spacing(2),
            paddingRight: theme.spacing(1),
            zIndex: 100,
            backgroundColor: "white",
            borderBottom: "1px solid rgba(224, 224, 224, 1)"
        },
        table: {},
        root: {
            height: "100%",
            display: "flex",
            flexDirection: "column"
        },
        tableContainer: {
            height: "100%",
            flexGrow: 1
        },
        highlight:
            theme.palette.type === "light"
                ? {
                    color: theme.palette.secondary.main,
                    backgroundColor: lighten(theme.palette.secondary.light, 0.85)
                }
                : {
                    color: theme.palette.text.primary,
                    backgroundColor: theme.palette.secondary.dark
                },
        visuallyHidden: {
            border: 0,
            clip: "rect(0 0 0 0)",
            height: 1,
            margin: -1,
            overflow: "hidden",
            padding: 0,
            position: "absolute",
            top: PAGE_SIZE,
            width: 1
        }
    })
);


interface CollectionTableProps<S extends EntitySchema> {
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
    properties?: (keyof S["properties"])[];

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

/**
 * This component renders a collection of entities in tabular format.
 * @param props
 * @constructor
 */
export default function CollectionTable<S extends EntitySchema>(props: CollectionTableProps<S>) {

    const classes = collectionStyles();

    const [data, setData] = React.useState<Entity<S>[]>([]);
    const [dataLoading, setDataLoading] = React.useState<boolean>();
    const [noMoreToLoad, setNoMoreToLoad] = React.useState<boolean>(false);
    const [dataLoadingError, setDataLoadingError] = React.useState<Error | undefined>();

    const [textSearchInProgress, setTextSearchInProgress] = React.useState<boolean>(false);
    const [textSearchLoading, setTextSearchLoading] = React.useState<boolean>(false);
    const [textSearchData, setTextSearchData] = React.useState<Entity<S>[]>([]);

    const [filter, setFilter] = React.useState<FilterValues<S> | undefined>(props.initialFilter);
    const [order, setOrder] = React.useState<Order>();
    const [orderBy, setOrderBy] = React.useState<string>();
    const [itemCount, setItemCount] = React.useState<number>(PAGE_SIZE);

    const tableRef = useRef<Element>();

    useEffect(() => {
        setDataLoading(true);
        console.log("useEffect", itemCount);
        const cancelSubscription = listenCollection<S>(
            props.collectionPath,
            props.schema,
            entities => {
                setDataLoading(false);
                setDataLoadingError(undefined);
                setData(entities);
                setNoMoreToLoad(entities.length < itemCount);
            },
            (error) => {
                console.log("ERROR", error);
                setDataLoading(false);
                setDataLoadingError(error);
            },
            filter,
            itemCount,
            undefined,
            orderBy,
            order);

        return () => cancelSubscription();
    }, [props.collectionPath, props.schema, itemCount, order, orderBy, filter]);

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
        setOrderBy(undefined);
    };

    const filterSet = filter && Object.keys(filter).length;

    const handleRequestSort = (event: React.MouseEvent<unknown>, property: any) => {
        if (filter) {
            const filterKeys = Object.keys(filter);
            if (filterKeys.length > 1 || filterKeys[0] !== property) {
                return;
            }
        }
        resetPagination();
        const isDesc = orderBy === property && order === "desc";
        const isAsc = orderBy === property && order === "asc";
        setOrder(isDesc ? "asc" : (isAsc ? undefined : "desc"));
        setOrderBy(isAsc ? undefined : property);
    };

    const onEntityClick = (event: React.MouseEvent<HTMLTableRowElement>, entity: Entity<S>) => {
        if (props.onEntityClick) {
            event.stopPropagation();
            props.onEntityClick(props.collectionPath, entity);
        }
    };

    const onEntityEdit = (event: React.MouseEvent<HTMLButtonElement>, entity: Entity<S>) => {
        if (props.onEntityEdit) {
            event.stopPropagation();
            props.onEntityEdit(props.collectionPath, entity);
        }
    };

    const onEntityDelete = (event: React.MouseEvent<HTMLButtonElement>, entity: Entity<S>) => {
        if (props.onEntityDelete) {
            event.stopPropagation();
            props.onEntityDelete(props.collectionPath, entity);
        }
    };

    const onFilterUpdate = (filterValues: FilterValues<S>) => {
        if (orderBy && filterValues) {
            const filterKeys = Object.keys(filterValues);
            if (filterKeys.length > 1 || filterKeys[0] !== orderBy) {
                resetSort();
            }
        }
        setFilter(filterValues);
    };


    let tableViewProperties = props.properties;
    if (!tableViewProperties) {
        tableViewProperties = Object.keys(props.schema.properties);
    }

    const editEnabled = !!props.onEntityEdit;
    const deleteEnabled = !!props.onEntityDelete;

    const buildTableRowButtons = <S extends EntitySchema>(entity: Entity<S> | null, index: number) => (
        <TableCell key={`row-buttons-${index}`}>

            {(editEnabled || deleteEnabled) &&
            <Box minWidth={96}>
                {editEnabled && <IconButton aria-label="edit"
                                            disabled={!entity || !editEnabled}
                                            onClick={editEnabled ? (event) => entity && onEntityEdit(event, entity) : undefined}>
                    <EditIcon color={"action"}/>
                </IconButton>}

                {deleteEnabled && <IconButton aria-label="delete"
                                              disabled={!entity || !deleteEnabled}
                                              onClick={deleteEnabled ? (event) => entity && onEntityDelete(event, entity) : undefined}>
                    <DeleteIcon/>
                </IconButton>}
            </Box>
            }

            <Box maxWidth={96}
                 component="div"
                 textAlign="center"
                 textOverflow="ellipsis"
                 overflow="hidden">
                {entity ?
                    <Typography variant={"caption"}> {entity.id} </Typography>
                    :
                    renderSkeletonText()
                }
            </Box>

        </TableCell>
    );

    function buildTableRow<S extends EntitySchema>(entity: Entity<S>, index: number, small: boolean) {
        return (
            <TableRow
                key={`table_${entity.id}_${index}`}
                hover
                onClick={(event) => onEntityClick(event, entity)}
                tabIndex={-1}
            >

                {buildTableRowButtons(entity, index)}

                {tableViewProperties && tableViewProperties
                    .map((key, index) =>
                        renderTableCell(key as string, index, entity.values[key as string], props.schema.properties[key as string] as Property, small))}

                {props.additionalColumns && props.additionalColumns
                    .map((delegate, index) =>
                        renderCustomTableCell(index, delegate.builder(entity)))}

            </TableRow>
        );
    }


    function buildTableRowSkeleton<S extends EntitySchema>(index: number) {
        const buttonsCell = buildTableRowButtons(null, index);

        return (
            <TableRow
                key={`table_row_skeleton_${index}`}
                tabIndex={-1}
            >

                {buttonsCell}

                {tableViewProperties && tableViewProperties
                    .map((key, index) =>
                        renderTableSkeletonCell(index, key as string, props.schema.properties[key as string]))}

                {props.additionalColumns && props.additionalColumns
                    .map((delegate, index) =>
                        <TableCell key={`table-cell-additional-${index}`}
                                   component="th">
                            {renderSkeletonText(index)}
                        </TableCell>)}

            </TableRow>
        );
    }

    function buildErrorView<S extends EntitySchema>() {
        return (
            <Box display="flex"
                 justifyContent="center"
                 margin={6}>
                {"Error fetching data from Firestore"}
            </Box>
        );
    }

    function buildEmptyView<S extends EntitySchema>() {
        return (
            <Box display="flex"
                 justifyContent="center"
                 margin={6}>
                {filterSet ? "No data with the selected filters" : "This collection is empty"}
            </Box>
        );
    }

    const tableBody =
        <TableBody>
            {!textSearchInProgress && data.map((entity, index) => {
                return buildTableRow(entity, index, props.small);
            })}

            {textSearchInProgress && !textSearchLoading && textSearchData
                .map((entity, index) => {
                    return buildTableRow(entity, index, props.small);
                })}

            {dataLoading && [0, 1, 2, 3, 4]
                .map((_, index) => {
                    return buildTableRowSkeleton(index);
                })}
        </TableBody>;

    const textSearchEnabled = !!props.textSearchDelegate;

    async function onTextSearch(searchString?: string) {
        if (textSearchEnabled) {
            setTextSearchLoading(true);
            const textSearchDelegate = props.textSearchDelegate as TextSearchDelegate;
            if (!searchString) {
                setTextSearchData([]);
                setTextSearchInProgress(false);
            } else {
                setTextSearchInProgress(true);
                const ids = await textSearchDelegate.performTextSearch(searchString);
                const promises: Promise<Entity<S>>[] = ids
                    .map((id) => fetchEntity(props.collectionPath, id, props.schema));
                const entities = await Promise.all(promises);
                setTextSearchData(entities);
            }
            setTextSearchLoading(false);
        }
    }

    const onTableScroll = () => {
        if (tableRef.current && tableRef.current.getBoundingClientRect().bottom <= window.innerHeight + PIXEL_NEXT_PAGE_OFFSET) {
            loadNextPage();
        }

    };

    return (

        <Paper elevation={0} className={classes.root}>

            {props.includeToolbar &&
            <CollectionTableToolbar schema={props.schema}
                                    filterValues={filter}
                                    onTextSearch={textSearchEnabled ? onTextSearch : undefined}
                                    collectionPath={props.collectionPath}
                                    filterableProperties={props.filterableProperties}
                                    actions={props.actions}
                                    overrideTitle={props.overrideTitle}
                                    onFilterUpdate={onFilterUpdate}/>}


            <TableContainer
                onScroll={onTableScroll}
                className={classes.tableContainer}>

                {dataLoadingError &&
                <Box m={5}>
                    <Grid container spacing={2} justify="center">
                        <Grid container justify="center">
                            <Typography
                                variant={"h6"}
                                color={"error"}>{dataLoadingError.name}</Typography>
                        </Grid>
                        <Grid container justify="center">
                            <Typography
                                color={"error"}>{dataLoadingError.message}</Typography>
                        </Grid>
                    </Grid>
                </Box>}

                {!dataLoadingError &&

                <Table
                    innerRef={tableRef}
                    className={classes.table}
                    aria-labelledby="tableTitle"
                    size={"small"}
                    stickyHeader={true}
                    aria-label="Table"
                >

                    <CollectionTableHead
                        classes={classes}
                        schema={props.schema}
                        order={order}
                        orderBy={orderBy}
                        sortable={!textSearchData.length}
                        tableViewProperties={tableViewProperties}
                        additionalColumns={props.additionalColumns}
                        onRequestSort={handleRequestSort}
                    />
                    {tableBody}
                </Table>
                }

                {dataLoadingError && buildErrorView()}
                {!dataLoadingError && !textSearchInProgress && !data?.length && buildEmptyView()}

            </TableContainer>

        </Paper>
    );
}


type Order = "asc" | "desc" | undefined;


interface CollectionTableToolbarProps<S extends EntitySchema> {
    collectionPath: string;
    schema: S;
    filterValues?: FilterValues<S>;
    onTextSearch?: (searchString?: string) => void;
    filterableProperties?: (keyof S["properties"])[];
    actions?: React.ReactChild;

    /**
     * Override the title in the toolbar
     */
    overrideTitle?: string,

    onFilterUpdate?(filterValues: FilterValues<S>): void;
}

function CollectionTableToolbar<S extends EntitySchema>(props: CollectionTableToolbarProps<S>) {
    const classes = collectionStyles();

    const filterEnabled = props.onFilterUpdate && props.filterableProperties && props.filterableProperties.length > 0;
    const filterView = filterEnabled && props.onFilterUpdate && props.filterableProperties &&
        <FilterPopup schema={props.schema}
                     filterValues={props.filterValues}
                     onFilterUpdate={props.onFilterUpdate}
                     filterableProperties={props.filterableProperties}/>
    ;

    return (
        <Toolbar
            className={classes.toolbar}
        >
            <Box
                display={"flex"}
                flexDirection="row"
                justifyContent="space-between"
                alignItems="center"
                width={"100%"}
            >


                <Hidden xsDown>
                    <Box display={"flex"}
                         alignItems="center">
                        <Box mr={2}>
                            <Typography variant="h6">
                                {props.overrideTitle ? props.overrideTitle : `${props.schema.name} list`}
                            </Typography>
                            <Typography variant={"caption"}>
                                {props.collectionPath}
                            </Typography>
                        </Box>

                        {filterEnabled && filterView}

                    </Box>
                </Hidden>

                {filterEnabled && <Hidden smUp>
                    {filterView}
                </Hidden>}


                {props.onTextSearch &&
                <SearchBar
                    onTextSearch={props.onTextSearch}/>
                }

                {props.actions}
            </Box>

        </Toolbar>
    );
}


function renderTableCell(name: string, index: number, value: any, property: Property, small: boolean) {
    return (
        <TableCell key={`table-cell-${name}`} component="td"
                   align={getCellAlignment(property)}>
            <PreviewComponent name={name}
                              value={value}
                              property={property}
                              small={small}/>
        </TableCell>
    );
}

function renderTableSkeletonCell(index: number, key: string, property: Property) {
    return (
        <TableCell key={`table-cell-${key}`} component="td"
                   align={getCellAlignment(property)}>

            <SkeletonComponent
                property={property}
                small={false}/>
        </TableCell>
    );
}

function renderCustomTableCell(index: number, element: React.ReactNode) {
    return (
        <TableCell key={`table-additional-${index}`} component="td">
            {element}
        </TableCell>
    );
}
