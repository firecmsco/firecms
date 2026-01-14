import React from "react";
import { Table, TableBody, TableHeader, TableRow, TableCell } from "@firecms/ui";

export default function TableCustomHeadingDemo() {
    return (
        <Table className="bg-surface-50 dark:bg-surface-900">
            <TableHeader className="bg-surface-50 dark:bg-surface-800">
                <TableCell header scope="col" className="custom-header-cell">Product</TableCell>
                <TableCell header scope="col" className="custom-header-cell">Price</TableCell>
                <TableCell header scope="col" className="custom-header-cell">Stock</TableCell>
            </TableHeader>
            <TableBody className="bg-surface-100 dark:bg-surface-900">
                <TableRow className="hover:bg-surface-200 hover:dark:bg-surface-800" onClick={() => console.log("Clicked")}>
                    <TableCell>Apple</TableCell>
                    <TableCell className="bg-surface-200 dark:bg-surface-700">$1.00</TableCell>
                    <TableCell>In Stock</TableCell>
                </TableRow>
                <TableRow className="hover:bg-surface-200 hover:dark:bg-surface-800" onClick={() => console.log("Clicked")}>
                    <TableCell>Banana</TableCell>
                    <TableCell className="bg-surface-200 dark:bg-surface-700">$0.50</TableCell>
                    <TableCell>Out of Stock</TableCell>
                </TableRow>
            </TableBody>
        </Table>
    );
}
