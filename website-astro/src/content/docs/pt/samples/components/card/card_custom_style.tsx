import React from "react";
import { Card } from "@firecms/ui";

export default function CardCustomStyleDemo() {
    const styles = {
        padding: '20px',
        color: "red",
        backgroundColor: '#f9f9f9',
        borderRadius: '8px',
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    };

    return (
        <Card style={styles}>
            Card with custom styling.
        </Card>
    );
}
