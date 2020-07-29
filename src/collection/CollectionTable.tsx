import React, { useEffect } from "react";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TablePagination from "@material-ui/core/TablePagination";
import TableRow from "@material-ui/core/TableRow";
import TableSortLabel from "@material-ui/core/TableSortLabel";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import Paper from "@material-ui/core/Paper";
import { collectionStyles } from "../styles";
import { Box, Grid, IconButton, TableContainer } from "@material-ui/core";
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
     * In case this table should have some filters set by default
     */
    initialFilter?: FilterValues<S>;

    /**
     * Is pagination enabled in the bottom of the table
     */
    paginationEnabled: boolean,

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
    const [dataLoadingError, setDataLoadingError] = React.useState<Error | undefined>();

    const [textSearchInProgress, setTextSearchInProgress] = React.useState<boolean>(false);
    const [textSearchLoading, setTextSearchLoading] = React.useState<boolean>(false);
    const [textSearchData, setTextSearchData] = React.useState<Entity<S>[]>([]);

    const [filter, setFilter] = React.useState<FilterValues<S> | undefined>(props.initialFilter);
    const [order, setOrder] = React.useState<Order>();
    const [orderBy, setOrderBy] = React.useState<string>();
    const [page, setPage] = React.useState<number>(0);
    const [pageKeys, setPageKeys] = React.useState<any[]>([]);
    const [rowsPerPage, setRowsPerPage] = React.useState<number | undefined>(props.paginationEnabled ? 10 : undefined);

    useEffect(() => {
        const startAfter = pageKeys[page];
        setDataLoading(true);

        const cancelSubscription = listenCollection<S>(
            props.collectionPath,
            props.schema,
            entities => {
                setDataLoading(false);
                setDataLoadingError(undefined);
                if (entities.length) {
                    const lastEntity = entities[entities.length - 1];
                    pageKeys[page + 1] = orderBy ? lastEntity.values[orderBy] : lastEntity.snapshot;
                }
                setData(entities);
            },
            (error) => {
                setDataLoading(false);
                setDataLoadingError(error);
            },
            filter,
            rowsPerPage,
            startAfter,
            orderBy,
            order);

        return () => cancelSubscription();
    }, [props.collectionPath, props.schema, rowsPerPage, page, order, orderBy, pageKeys, filter]);

    const resetPagination = () => {
        setPage(0);
        setPageKeys([]);
    };

    const resetSort = () => {
        setOrder(undefined);
        setOrderBy(undefined);
    };

    const handleRequestSort = (event: React.MouseEvent<unknown>, property: string) => {
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
        if (orderBy) {
            const filterKeys = Object.keys(filterValues);
            if (filterKeys.length > 1 || filterKeys[0] !== orderBy) {
                resetSort();
            }
        }
        setFilter(filterValues);
    };

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const emptyRows = rowsPerPage ? data.length - rowsPerPage : 0;
    let tableViewProperties = props.properties;
    if (!tableViewProperties) {
        tableViewProperties = Object.keys(props.schema.properties);
    }

    const editEnabled = !!props.onEntityEdit;
    const deleteEnabled = !!props.onEntityDelete;

    const buildTableRowButtons = <S extends EntitySchema>(entity: Entity<S> | null, index: number) => (
        <TableCell key={`row-buttons-${index}`}>
            <Box minWidth={96}>
                <IconButton aria-label="edit"
                            disabled={!entity || !editEnabled}
                            onClick={editEnabled ? (event) => entity && onEntityEdit(event, entity) : undefined}>
                    <EditIcon color={"action"}/>
                </IconButton>

                <IconButton aria-label="delete"
                            disabled={!entity || !deleteEnabled}
                            onClick={deleteEnabled ? (event) => entity && onEntityDelete(event, entity) : undefined}>
                    <DeleteIcon/>
                </IconButton>
            </Box>

            <Box maxWidth={96}
                 component="div"
                 textAlign="center"
                 textOverflow="ellipsis"
                 overflow="auto">
                {entity ?
                    <Typography variant={"caption"}> {entity.id} </Typography>
                    :
                    renderSkeletonText()
                }
            </Box>

        </TableCell>
    );

    function buildTableRow<S extends EntitySchema>(entity: Entity<S>, index: number) {
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
                        renderTableCell(index, entity.values[key as string], key as string, props.schema.properties[key as string] as Property))}

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

    const skeletonBody = <TableBody>
        {[0, 1, 2, 3, 4]
            .map((_, index) => {
                return buildTableRowSkeleton(index);
            })}
    </TableBody>;

    const tableBody = <TableBody>
        {textSearchInProgress && textSearchData
            .map((entity, index) => {
                return buildTableRow(entity, index);
            })}

        {!textSearchInProgress && data
            .map((entity, index) => {
                return buildTableRow(entity, index);
            })}

        {emptyRows > 0 && (
            <TableRow style={{ height: 53 * emptyRows }}>
                <TableCell colSpan={tableViewProperties.length}/>
            </TableRow>
        )}
    </TableBody>;

    const body =
        (dataLoading || textSearchLoading) ? skeletonBody : tableBody;

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

    return (

        <Paper elevation={1} className={classes.tableWrapper}>

            {props.includeToolbar &&
            <CollectionTableToolbar schema={props.schema}
                                    filterValues={filter}
                                    onTextSearch={textSearchEnabled ? onTextSearch : undefined}
                                    collectionPath={props.collectionPath}
                                    filterableProperties={props.filterableProperties}
                                    onFilterUpdate={onFilterUpdate}/>}

            <TableContainer>

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
                    className={classes.table}
                    aria-labelledby="tableTitle"
                    size={"medium"}
                    stickyHeader={true}
                    aria-label="enhanced table"
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
                    {body}
                </Table>
                }

            </TableContainer>

            {props.paginationEnabled && !textSearchInProgress && rowsPerPage &&
            <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={Infinity}
                rowsPerPage={rowsPerPage}
                page={page}
                backIconButtonProps={{
                    "aria-label": "previous page"
                }}
                nextIconButtonProps={{
                    "aria-label": "next page"
                }}
                onChangePage={handleChangePage}
                onChangeRowsPerPage={handleChangeRowsPerPage}
            />
            }

        </Paper>
    );
}


type Order = "asc" | "desc" | undefined;

interface CollectionTableHeadProps<S extends EntitySchema> {
    classes: ReturnType<typeof collectionStyles>;
    onRequestSort: (event: React.MouseEvent<unknown>, property: string) => void;
    order?: Order;
    orderBy?: string;
    sortable: boolean;
    schema: S;
    additionalColumns?: AdditionalColumnDelegate<S>[];
    tableViewProperties: (keyof S["properties"])[];
}

interface HeadCell {
    index: number;
    id: string;
    label: string;
    align: "right" | "left";
}

function CollectionTableHead<S extends EntitySchema>({
                                                         classes,
                                                         order,
                                                         orderBy,
                                                         sortable,
                                                         onRequestSort,
                                                         schema,
                                                         tableViewProperties,
                                                         additionalColumns
                                                     }: CollectionTableHeadProps<S>) {


    const createSortHandler = (property: string) => (event: React.MouseEvent<unknown>) => {
        onRequestSort(event, property);
    };

    const headCells: HeadCell[] = tableViewProperties
        .map((key, index) => {
            const property = schema.properties[key as string];
            return ({
                index: index,
                id: key as string,
                align: getCellAlignment(property),
                label: property.title || key as string
            });
        });

    return (
        <TableHead>
            <TableRow>

                <TableCell
                    key={"header-id"}
                    align={"center"}
                    padding={"default"}>Id</TableCell>

                {headCells.map(headCell => {
                    const active = sortable && orderBy === headCell.id;
                    return (
                        <TableCell
                            key={headCell.id}
                            align={headCell.align}
                            padding={"default"}
                            sortDirection={active ? order : false}
                        >
                            <TableSortLabel
                                active={active}
                                direction={order}
                                onClick={createSortHandler(headCell.id)}
                            >
                                {headCell.label}
                                {active ?
                                    <span className={classes.visuallyHidden}>
                                         {order === "desc" ? "Sorted descending" : (order === "asc" ? "Sorted ascending" : "")}
                                    </span>
                                    : null}
                            </TableSortLabel>
                        </TableCell>
                    );
                })}

                {additionalColumns && additionalColumns.map((additionalColumn, index) => {
                    return (
                        <TableCell
                            key={`head-additional-${index}`}
                            align={"left"}
                            padding={"default"}
                        >
                            {additionalColumn.title}
                        </TableCell>
                    );
                })}

            </TableRow>
        </TableHead>
    );
}

interface CollectionTableToolbarProps<S extends EntitySchema> {
    collectionPath: string;
    schema: S;
    filterValues?: FilterValues<S>;
    onTextSearch?: (searchString?: string) => void;
    filterableProperties?: (keyof S["properties"])[];

    onFilterUpdate?(filterValues: FilterValues<S>): void;
}

function CollectionTableToolbar<S extends EntitySchema>(props: CollectionTableToolbarProps<S>) {
    const classes = collectionStyles();

    return (
        <Toolbar
            className={classes.toolbar}
        >
            <Grid
                container
                direction="row"
                justify="space-between"
                alignItems="center"
            >
                <Grid item>
                    <Box className={classes.title}>
                        <Typography variant="h6">
                            {props.schema.name} list
                        </Typography>
                        <Typography variant={"caption"}>
                            {props.collectionPath}
                        </Typography>
                    </Box>
                </Grid>
                <Grid item>
                    {props.onTextSearch &&
                    <Box className={classes.searchBar}>
                        <SearchBar
                            onTextSearch={props.onTextSearch}/>
                    </Box>
                    }
                </Grid>
                <Grid item>
                    {props.onFilterUpdate && props.filterableProperties && props.filterableProperties.length > 0 &&
                    <FilterPopup schema={props.schema}
                                 filterValues={props.filterValues}
                                 onFilterUpdate={props.onFilterUpdate}
                                 filterableProperties={props.filterableProperties}/>
                    }
                </Grid>
            </Grid>

        </Toolbar>
    );
}


function renderTableCell(index: number, value: any, key: string, property: Property) {
    return (
        <TableCell key={`table-cell-${key}`} component="th"
                   align={getCellAlignment(property)}>

            <PreviewComponent value={value}
                              property={property}
                              small={false}/>
        </TableCell>
    );
}

function renderTableSkeletonCell(index: number, key: string, property: Property) {
    return (
        <TableCell key={`table-cell-${key}`} component="th"
                   align={getCellAlignment(property)}>

            <SkeletonComponent
                property={property}
                small={false}/>
        </TableCell>
    );
}

function renderCustomTableCell(index: number, element: React.ReactNode) {
    return (
        <TableCell key={`table-additional-${index}`} component="th">
            {element}
        </TableCell>
    );
}

function getCellAlignment(property: Property): "right" | "left" {
    return property.dataType === "number" || property.dataType === "timestamp" ? "right" : "left";
}
