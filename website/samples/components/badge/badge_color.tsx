import React from "react";
import { Badge, Chip } from "@firecms/ui";

export default function BadgeColorDemo() {
    return (
        <>
            <Badge color="primary">
                <Chip>Primary color</Chip>
            </Badge>

            <Badge color="secondary">
                <Chip>Secondary color</Chip>
            </Badge>

            <Badge color="error">
                <Chip>Error color</Chip>
            </Badge>
        </>
    );
}
