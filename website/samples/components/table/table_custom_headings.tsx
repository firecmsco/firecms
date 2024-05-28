import React from "react";
import { Table, TableBody, TableHeader, TableRow, TableCell } from "@firecms/ui";

export default function TableCustomHeadingDemo() {
    return (
        <Table className="custom-table">
            <TableHeader className="custom-header">
                <TableCell header scope="col" className="custom-header-cell">Product</TableCell>
                <TableCell header scope="col" className="custom-header-cell">Price</TableCell>
                <TableCell header scope="col" className="custom-header-cell">Stock</TableCell>
            </TableHeader>
            <TableBody className="custom-body">
                <TableRow className="custom-row">
                    <TableCell className="custom-cell">Apple</TableCell>
                    <TableCell className="custom-cell">$1.00</TableCell>
                    <TableCell className="custom-cell">In Stock</TableCell>
                </TableRow>
                <TableRow className="custom-row">
                    <TableCell className="custom-cell">Banana</TableCell>
                    <TableCell className="custom-cell">$0.50</TableCell>
                    <TableCell className="custom-cell">Out of Stock</TableCell>
                </TableRow>
            </TableBody>
        </Table>
    );
}