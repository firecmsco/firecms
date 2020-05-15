import React, { useEffect, useState } from "react";
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
import {
    Box,
    DialogContent,
    Grid,
    IconButton,
    Snackbar,
    TableContainer
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
import {
    getCollectionTableProperties,
    getFilterableProperties
} from "../util/properties";
import Button from "@material-ui/core/Button";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogActions from "@material-ui/core/DialogActions";
import Dialog from "@material-ui/core/Dialog";
import { deleteEntity } from "../firebase/firestore";
import MuiAlert from "@material-ui/lab/Alert/Alert";
import { CircularProgressCenter } from "../util";
import EntityPreview from "../preview/EntityPreview";
import PreviewComponent from "../preview/PreviewComponent";

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
     * Should this component allow deletion of entries
     */
    deleteEnabled: boolean,

    /**
     * Should the table add an edit button
     */
    onEntityEdit?(collectionPath: string, entity: Entity<S>): void;

    /**
     * Callback when anywhere on the table is clicked
     */
    onEntityClick?(collectionPath: string, entity: Entity<S>): void;
}

/**
 * This component renders a collection of entities in tabular format.
 * @param props
 * @constructor
 */
export default function CollectionTable<S extends EntitySchema>(props: CollectionTableProps<S>) {

    const classes = useStyles();
    const [data, setData] = React.useState<Entity<S>[]>([]);
    const [textSearchInProgress, setTextSearchInProgress] = React.useState<boolean>(false);
    const [textSearchData, setTextSearchData] = React.useState<Entity<S>[]>([]);
    const [filter, setFilter] = React.useState<FilterValues<S> | undefined>(props.initialFilter);
    const [order, setOrder] = React.useState<Order>();
    const [orderBy, setOrderBy] = React.useState<string>();
    const [page, setPage] = React.useState<number>(0);
    const [pageKeys, setPageKeys] = React.useState<any[]>([]);
    const [rowsPerPage, setRowsPerPage] = React.useState<number | undefined>(props.paginationEnabled ? 10 : undefined);
    const [deleteEntityClicked, setDeleteEntityClicked] = React.useState<Entity<S> | undefined>(undefined);

    useEffect(() => {
        const startAfter = pageKeys[page];
        const cancelSubscription = listenCollection<S>(
            props.collectionPath,
            props.schema,
            entities => {
                if (entities.length)
                    {
                        const lastEntity = entities[entities.length - 1];
                        pageKeys[page + 1] = orderBy? lastEntity.values[orderBy] : lastEntity.snapshot ;
                    }
                setData(entities);
            },
            filter, rowsPerPage, startAfter, orderBy, order);
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

    const onEntityClick = (entity: Entity<S>) => {
        if (props.onEntityClick) {
            props.onEntityClick(props.collectionPath, entity);
        }
    };

    const onEntityEdit = (entity: Entity<S>) => {
        if (props.onEntityEdit) {
            props.onEntityEdit(props.collectionPath, entity);
        }
    };

    const onEntityDelete = (entity: Entity<S>) => {
        setDeleteEntityClicked(entity);
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
    const hasDeleteButton = props.deleteEnabled;

    function buildTableRow<S extends EntitySchema>(entity: Entity<S>, index: number) {
        return (
            <TableRow
                key={`table_${entity.snapshot.id}_${index}`}
                hover
                onClick={(event) => onEntityClick(entity)}
                tabIndex={-1}
            >

                {hasEditButton && renderEditCell(entity, onEntityEdit)}

                {hasDeleteButton && renderDeleteCell(entity, onEntityDelete)}

                {renderIdCell(entity.id)}

                {tableViewFields
                    .map(([key, field], index) =>
                        renderTableCell(index, entity.values[key], key, field))}

                {props.additionalColumns && props.additionalColumns
                    .map((delegate, index) =>
                        renderCustomTableCell(index, delegate.builder(entity)))}

            </TableRow>
        );
    }

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

    const textSearchEnabled = !!props.textSearchDelegate;

    async function onTextSearch(searchString?: string) {
        if (textSearchEnabled) {
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
                        hasEditButton={hasEditButton}
                        hasDeleteButton={hasDeleteButton}
                        order={order}
                        orderBy={orderBy}
                        sortable={!textSearchData.length}
                        additionalColumns={props.additionalColumns}
                        onRequestSort={handleRequestSort}
                    />
                    {tableBody}
                </Table>
            </div>

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

            <DeleteEntityDialog entity={deleteEntityClicked}
                                schema={props.schema}
                                open={!!deleteEntityClicked}
                                onClose={() => setDeleteEntityClicked(undefined)}/>

        </TableContainer>
    );
}


type Order = "asc" | "desc" | undefined;

interface CollectionTableHeadProps<S extends EntitySchema> {
    classes: ReturnType<typeof useStyles>;
    hasEditButton: boolean;
    hasDeleteButton: boolean;
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
                                                         hasEditButton,
                                                         hasDeleteButton,
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

                {hasEditButton && <TableCell
                    key={"header-edit"}
                    align={"left"}
                    padding={"default"}/>
                }

                {hasDeleteButton && <TableCell
                    key={"header-delete"}
                    align={"left"}
                    padding={"default"}/>
                }

                <TableCell
                    key={"header-id"}
                    align={"left"}
                    padding={"default"}> Id </TableCell>

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

    const filterableProperties = getFilterableProperties(props.schema.properties);

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

function renderIdCell(id: string) {
    return (
        <TableCell key={`table-cell-id-${id}`} component="th" align={"left"}>
            <Typography variant={"caption"}> {id}</Typography>
        </TableCell>
    );
}

function renderDeleteCell<S extends EntitySchema>(entity: Entity<S>, onDelete: Function) {
    return (
        <TableCell key={`table-cell-delete-${entity.id}`}
                   component="th"
                   padding={"none"}
                   align={"left"}>
            <IconButton aria-label="delete"
                        onClick={() => onDelete(entity)}>
                <DeleteIcon fontSize={"small"}/>
            </IconButton>
        </TableCell>
    );
}

function renderEditCell<S extends EntitySchema>(entity: Entity<S>, onEdit: Function) {
    return (
        <TableCell key={`table-cell-edit-${entity.id}`}
                   component="th"
                   align={"right"}>
            <IconButton aria-label="edit"
                        onClick={() => onEdit(entity)}>
                <EditIcon color={"action"}/>
            </IconButton>
        </TableCell>
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

export interface DeleteEntityDialogProps<S extends EntitySchema> {
    entity?: Entity<S>,
    schema: S
    open: boolean;
    onClose: (value?: string) => void;
}

function DeleteEntityDialog<S extends EntitySchema>(props: DeleteEntityDialogProps<S>) {
    const { entity, schema, onClose, open, ...other } = props;
    const [loading, setLoading] = useState(false);
    const [openSnackBar, setOpenSnackbar] = React.useState<boolean>(false);

    const handleCancel = () => {
        onClose();
    };

    const handleOk = () => {
        if (entity) {
            setOpenSnackbar(true);
            setLoading(true);
            deleteEntity(entity).then(_ => setLoading(false));
            onClose();
        }
    };

    return (
        <React.Fragment>

            <Dialog
                disableBackdropClick
                disableEscapeKeyDown
                maxWidth="md"
                keepMounted
                aria-labelledby="confirmation-dialog-title"
                open={open}
                {...other}
            >
                <DialogTitle id="confirmation-dialog-title">
                    Would you like to delete this {schema.name}?
                </DialogTitle>

                <DialogContent dividers>
                    {entity && <EntityPreview entity={entity} schema={schema}/>}
                </DialogContent>

                {loading && <CircularProgressCenter/>}

                {!loading &&
                <DialogActions>
                    <Button autoFocus onClick={handleCancel}
                            color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleOk} color="primary">
                        Ok
                    </Button>
                </DialogActions>}

            </Dialog>

            <Snackbar open={openSnackBar} autoHideDuration={3000}
                      onClose={(_) => setOpenSnackbar(false)}>
                <MuiAlert elevation={6} variant="filled"
                          onClose={(_) => setOpenSnackbar(false)}>
                    Deleted
                </MuiAlert>
            </Snackbar>

        </React.Fragment>
    );
}


