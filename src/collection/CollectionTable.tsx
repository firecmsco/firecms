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
import { IconButton, TableContainer } from "@material-ui/core";
import DeleteIcon from "@material-ui/icons/Delete";
import EditIcon from "@material-ui/icons/Edit";
import renderPreviewComponent from "../preview";
import {
    Entity,
    EntitySchema,
    FilterValues,
    Properties,
    Property
} from "../models";
import { listenCollection } from "../firebase";
import FilterPopup from "./FilterPopup";

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
     *
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
    const [filter, setFilter] = React.useState<FilterValues<S> | undefined>(props.initialFilter);
    const [order, setOrder] = React.useState<Order>();
    const [orderBy, setOrderBy] = React.useState<string>();
    const [page, setPage] = React.useState<number>(0);
    const [pageKeys, setPageKeys] = React.useState<any[]>([]);
    const [rowsPerPage, setRowsPerPage] = React.useState<number | undefined>(props.paginationEnabled ? 10 : undefined);

    useEffect(() => {
        const startAfter = pageKeys[page];
        const cancelSubscription = listenCollection<S>(props.collectionPath, props.schema,
            entities => {
                if (entities.length)
                    pageKeys[page + 1] = entities[entities.length - 1].snapshot;
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

    const tableBody = <TableBody>
        {data
            .map((entity, index) => {
                return (
                    <TableRow
                        key={`table_${entity.snapshot.id}_${index}`}
                        hover
                        onClick={(event) => onEntityClick(entity)}
                        tabIndex={-1}
                    >

                        {hasEditButton && renderEditCell(entity, onEntityEdit)}
                        {renderIdCell(entity.id)}
                        {tableViewFields
                            .map(([key, field], index) => renderTableCell(index, entity.values[key], key, field))}
                    </TableRow>
                );
            })}
        {emptyRows > 0 && (
            <TableRow style={{ height: 53 * emptyRows }}>
                <TableCell colSpan={tableViewFields.length}/>
            </TableRow>
        )}
    </TableBody>;

    return (

        <TableContainer component={Paper} elevation={1}>

            {props.includeToolbar &&
            <CollectionTableToolbar schema={props.schema}
                                    initialFilterValues={filter}
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
                        order={order}
                        orderBy={orderBy}
                        onRequestSort={handleRequestSort}
                    />
                    {tableBody}
                </Table>
            </div>

            {props.paginationEnabled && rowsPerPage && <TablePagination
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
    hasEditButton: boolean;
    onRequestSort: (event: React.MouseEvent<unknown>, property: string) => void;
    order?: Order;
    orderBy?: string;
    schema: S;
}

interface CollectionTableToolbarProps<S extends EntitySchema> {
    collectionPath: string;
    schema: S;
    initialFilterValues?: FilterValues<S>;

    onFilterUpdate?(filterValues: FilterValues<S>): void;
}

interface HeadCell {
    index: number;
    id: string;
    label: string;
    align: "right" | "left";
}

function CollectionTableHead<S extends EntitySchema>(props: CollectionTableHeadProps<S>) {
    const { classes, order, orderBy, onRequestSort, schema } = props;
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
                {props.hasEditButton && <TableCell
                    key={"header-edit"}
                    align={"left"}
                    padding={"default"}/>
                }

                <TableCell
                    key={"header-id"}
                    align={"left"}
                    padding={"default"}> Id </TableCell>

                {headCells.map(headCell => (
                    <TableCell
                        key={headCell.id}
                        align={headCell.align}
                        padding={"default"}
                        sortDirection={orderBy === headCell.id ? order : false}
                    >
                        <TableSortLabel
                            active={orderBy === headCell.id}
                            direction={order}
                            onClick={createSortHandler(headCell.id)}
                        >
                            {headCell.label}
                            {orderBy === headCell.id ?
                                (
                                    <span className={classes.visuallyHidden}>
                  {order === "desc" ? "sorted descending" : (order === "asc" ? "sorted ascending" : "")}
                </span>
                                ) : null}
                        </TableSortLabel>
                    </TableCell>
                ))}
            </TableRow>
        </TableHead>
    );
}

function CollectionTableToolbar<S extends EntitySchema>(props: CollectionTableToolbarProps<S>) {
    const classes = useToolbarStyles();

    return (
        <Toolbar
            className={classes.root}
        >
            <Typography className={classes.title} variant="h6">
                All {props.schema.name}
            </Typography>
            <Typography className={classes.title} variant={"caption"}>
                {props.collectionPath}
            </Typography>
            {props.onFilterUpdate &&
            <FilterPopup schema={props.schema}
                         initialValues={props.initialFilterValues}
                         onFilterUpdate={props.onFilterUpdate}/>
            }

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
        <TableCell key={`table-cell-delete-${entity.id}`} component="th"
                   align={"left"}>
            <IconButton aria-label="delete" onClick={() => onDelete(entity)}>
                <DeleteIcon/>
            </IconButton>
        </TableCell>
    );
}

function renderEditCell<S extends EntitySchema>(entity: Entity<S>, onEdit: Function) {
    return (
        <TableCell key={`table-cell-edit-${entity.id}`} component="th"
                   align={"left"}>
            <IconButton aria-label="edit" onClick={() => onEdit(entity)}>
                <EditIcon/>
            </IconButton>
        </TableCell>
    );
}

function renderTableCell(index: number, value: any, key: string, property: Property) {
    return (
        <TableCell key={`table-cell-${key}`} component="th"
                   align={getCellAlignment(property)}>
            {renderPreviewComponent(value, property)}
        </TableCell>
    );
}

function getCellAlignment(property: Property): "right" | "left" {
    return property.dataType === "number" || property.dataType === "timestamp" ? "right" : "left";
}

function getCollectionTableProperties(properties: Properties): [string, Property][] {
    return Object.entries(properties).filter(([_, property]) => property.includeInListView);
}
