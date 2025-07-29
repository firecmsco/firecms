import React from "react";
import { Table, TableBody, TableHeader, TableRow, TableCell } from "@firecms/ui";

export default function TableCustomHeadingDemo() {
    return (
        <Table className="bg-slate-50 dark:bg-slate-900">
            <TableHeader className="bg-slate-50 dark:bg-slate-800">
                <TableCell header scope="col" className="custom-header-cell">Product</TableCell>
                <TableCell header scope="col" className="custom-header-cell">Price</TableCell>
                <TableCell header scope="col" className="custom-header-cell">Stock</TableCell>
            </TableHeader>
            <TableBody className="bg-slate-100 dark:bg-slate-900">
                <TableRow className="hover:bg-slate-200 dark:hover:bg-slate-800" onClick={() => console.log("Clicked")}>
                    <TableCell>Apple</TableCell>
                    <TableCell className="bg-slate-200 dark:bg-slate-700">$1.00</TableCell>
                    <TableCell>In Stock</TableCell>
                </TableRow>
                <TableRow className="hover:bg-slate-200 dark:hover:bg-slate-800" onClick={() => console.log("Clicked")}>
                    <TableCell>Banana</TableCell>
                    <TableCell className="bg-slate-200 dark:bg-slate-700">$0.50</TableCell>
                    <TableCell>Out of Stock</TableCell>
                </TableRow>
            </TableBody>
        </Table>
    );
}
