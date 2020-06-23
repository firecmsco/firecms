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
import { useStyles, useToolbarStyles } from "../styles";
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
import {
    getCollectionTableProperties,
    getFilterableProperties
} from "../util/properties";
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
     * In case this table should have some filters set
     */
    initialFilter?: FilterValues<S>;

    /**
     * In case this table should have some filters set
     */
    paginationEnabled: boolean,

    /**
     * If a text search delegate is provided, a searchbar is displayed
     */
    textSearchDelegate?: TextSearchDelegate,

    /**
     * You can add additional columns to the collection view by implementing
     * an additional column delegate.
     */
    additionalColumns?: AdditionalColumnDelegate<S>[];

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

    const classes = useStyles();

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

    const handleRequestSort = (event: React.MouseEvent<unknown>, property: string) => {
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
    const tableViewFields = getCollectionTableProperties(props.schema.properties);

    const hasEditButton = !!props.onEntityEdit;
    const hasDeleteButton = !!props.onEntityDelete;

    const buildTableRowButtons = <S extends EntitySchema>(entity: Entity<S> | null, index: number) => (
        <TableCell key={`row-buttons-${index}`}>
            <Box minWidth={96}>
                {hasEditButton && (
                    <IconButton aria-label="edit"
                                disabled={!entity}
                                onClick={(event) => entity && onEntityEdit(event, entity)}>
                        <EditIcon color={"action"}/>
                    </IconButton>
                )}

                {hasDeleteButton && (
                    <IconButton aria-label="delete"
                                disabled={!entity}
                                onClick={(event) => entity && onEntityDelete(event, entity)}>
                        <DeleteIcon/>
                    </IconButton>
                )}
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

                {tableViewFields
                    .map(([key, field], index) =>
                        renderTableCell(index, entity.values[key], key, field))}

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

                {tableViewFields
                    .map(([key, field], index) =>
                        renderTableSkeletonCell(index, key, field))}

                {props.additionalColumns && props.additionalColumns
                    .map((delegate, index) =>
                        renderSkeletonText())}

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
                <TableCell colSpan={tableViewFields.length}/>
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

        <TableContainer component={Paper} elevation={1}>

            {props.includeToolbar &&
            <CollectionTableToolbar schema={props.schema}
                                    filterValues={filter}
                                    onTextSearch={textSearchEnabled ? onTextSearch : undefined}
                                    collectionPath={props.collectionPath}
                                    onFilterUpdate={onFilterUpdate}/>}

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
            <div className={classes.tableWrapper}>
                <Table stickyHeader
                       className={classes.table}
                       aria-labelledby="tableTitle"
                       size={"medium"}
                       aria-label="enhanced table"
                >
                    <CollectionTableHead
                        classes={classes}
                        schema={props.schema}
                        order={order}
                        orderBy={orderBy}
                        sortable={!textSearchData.length}
                        additionalColumns={props.additionalColumns}
                        onRequestSort={handleRequestSort}
                    />
                    {body}
                </Table>
            </div>
            }

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

        </TableContainer>
    );
}


type Order = "asc" | "desc" | undefined;

interface CollectionTableHeadProps<S extends EntitySchema> {
    classes: ReturnType<typeof useStyles>;
    onRequestSort: (event: React.MouseEvent<unknown>, property: string) => void;
    order?: Order;
    orderBy?: string;
    sortable: boolean;
    schema: S;
    additionalColumns?: AdditionalColumnDelegate<S>[];
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
                                                         additionalColumns
                                                     }: CollectionTableHeadProps<S>) {


    const createSortHandler = (property: string) => (event: React.MouseEvent<unknown>) => {
        onRequestSort(event, property);
    };

    const headCells: HeadCell[] = getCollectionTableProperties(schema.properties)
        .map(([key, field], index) => ({
            index: index,
            id: key,
            align: getCellAlignment(field),
            label: field.title || key
        }));

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

    onFilterUpdate?(filterValues: FilterValues<S>): void;
}

function CollectionTableToolbar<S extends EntitySchema>(props: CollectionTableToolbarProps<S>) {
    const classes = useToolbarStyles();

    const filterableProperties =
        getFilterableProperties(props.schema.properties);

    return (
        <Toolbar
            className={classes.root}
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
                            All {props.schema.name}
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
                    {props.onFilterUpdate && filterableProperties.length > 0 &&
                    <FilterPopup schema={props.schema}
                                 filterValues={props.filterValues}
                                 onFilterUpdate={props.onFilterUpdate}/>
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

