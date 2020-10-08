import { AdditionalColumnDelegate, EntitySchema } from "../models";
import React from "react";
import { getIconForProperty } from "../util/property_icons";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import TableSortLabel from "@material-ui/core/TableSortLabel";
import { Box } from "@material-ui/core";
import { collectionStyles } from "./CollectionTable";
import { getCellAlignment, Order } from "./common";
import firebase from "firebase";
import FieldPath = firebase.firestore.FieldPath;

interface HeadCell {
    index: number;
    id: string;
    label: string;
    icon: React.ReactNode;
    align: "right" | "left";
}


interface CollectionTableHeadProps<S extends EntitySchema> {
    classes: ReturnType<typeof collectionStyles>;
    onRequestSort: (event: React.MouseEvent<unknown>, property: any) => void;
    order?: Order;
    orderBy?: any;
    sortable: boolean;
    schema: S;
    additionalColumns?: AdditionalColumnDelegate<S>[];
    tableViewProperties: (keyof S["properties"])[];
}
export function CollectionTableHead<S extends EntitySchema>({
                                                                classes,
                                                                order,
                                                                orderBy,
                                                                sortable,
                                                                onRequestSort,
                                                                schema,
                                                                tableViewProperties,
                                                                additionalColumns
                                                            }: CollectionTableHeadProps<S>) {


    const createSortHandler = (property: any) => (event: React.MouseEvent<unknown>) => {
        onRequestSort(event, property);
    };

    const headCells: HeadCell[] = tableViewProperties
        .map((key, index) => {
            const property = schema.properties[key as string];
            return ({
                index: index,
                id: key as string,
                align: getCellAlignment(property),
                icon: getIconForProperty(property, "disabled", "small"),
                label: property.title || key as string
            });
        });

    const sortedById = orderBy === FieldPath.documentId();
    return (
        <TableHead>
            <TableRow>

                <TableCell
                    key={"header-id"}
                    align={"center"}
                    padding={"default"}>
                    <TableSortLabel
                        active={sortedById}
                        direction={order}
                        onClick={createSortHandler(FieldPath.documentId())}
                    >
                        Id
                        {sortedById ?
                            <span className={classes.visuallyHidden}>
                                         {order === "desc" ? "Sorted descending" : (order === "asc" ? "Sorted ascending" : "")}
                                    </span>
                            : null}
                    </TableSortLabel>
                </TableCell>

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
                                <Box display={"inherit"}
                                     paddingLeft={headCell.align === "right" ? "10px" : "0px"}
                                     paddingRight={headCell.align === "left" ? "10px" : "0px"}>{headCell.icon}</Box>

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
