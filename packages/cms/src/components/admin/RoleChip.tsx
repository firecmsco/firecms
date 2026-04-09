import React from "react";
import { Chip, ChipColorScheme } from "@rebasepro/ui";
import { Role } from "@rebasepro/types";
import { getColorSchemeForSeed, getColorSchemeForKey } from "@rebasepro/ui";

export function RoleChip({ role }: { role: Role }) {
    let colorScheme: ChipColorScheme;
    if (role.isAdmin) {
        colorScheme = getColorSchemeForKey("blueDarker");
    } else if (role.id === "editor") {
        colorScheme = getColorSchemeForKey("yellowLight");
    } else if (role.id === "viewer") {
        colorScheme = getColorSchemeForKey("grayLight");
    } else {
        colorScheme = getColorSchemeForSeed(role.id);
    }

    return (
        <Chip colorScheme={colorScheme} key={role.id}>
            {role.name}
        </Chip>
    );
}
