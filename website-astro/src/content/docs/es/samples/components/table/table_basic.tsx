import React from "react";
import { Table, TableBody, TableHeader, TableRow, TableCell } from "@firecms/ui";

export default function TableBasicDemo() {
    return (
        <Table>
            <TableHeader>
                <TableCell header scope="col">Name</TableCell>
                <TableCell header scope="col">Age</TableCell>
                <TableCell header scope="col">City</TableCell>
            </TableHeader>
            <TableBody>
                <TableRow>
                    <TableCell>John Doe</TableCell>
                    <TableCell>30</TableCell>
                    <TableCell>New York</TableCell>
                </TableRow>
                <TableRow>
                    <TableCell>Jane Smith</TableCell>
                    <TableCell>25</TableCell>
                    <TableCell>San Francisco</TableCell>
                </TableRow>
            </TableBody>
        </Table>
    );
}