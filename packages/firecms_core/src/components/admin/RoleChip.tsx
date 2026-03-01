import React from "react";
import { Chip } from "@firecms/ui";
import { Role } from "@firecms/types";
import { getColorSchemeForSeed } from "@firecms/ui";

export function RoleChip({ role }: { role: Role }) {
    let colorScheme: any;
    if (role.isAdmin) {
        colorScheme = "blueDarker";
    } else if (role.id === "editor") {
        colorScheme = "yellowLight";
    } else if (role.id === "viewer") {
        colorScheme = "grayLight";
    } else {
        colorScheme = getColorSchemeForSeed(role.id);
    }

    return (
        <Chip colorScheme={colorScheme as any} key={role.id}>
            {role.name}
        </Chip>
    );
}
