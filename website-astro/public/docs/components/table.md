# Table

The `Table` component is a flexible data container that allows you to display tabular data with various customization options. The table is composed of several subcomponents including `TableBody`, `TableHeader`, `TableRow`, and `TableCell` which offer distinct styling for different sections of the table.

## Usage

To use the `Table` component, you will generally use a combination of `Table`, `TableBody`, `TableHeader`, `TableRow`, and `TableCell` components.

## Basic Table

A basic table showcasing the default structure.

```tsx
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
```

## Table with Custom Styling

Apply any style or base attributes to the table components.

```tsx
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

```

