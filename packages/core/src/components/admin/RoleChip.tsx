import React from "react";
import { Chip } from "@rebasepro/ui";
import { Role } from "@rebasepro/types";
import { getColorSchemeForSeed } from "@rebasepro/ui";

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
