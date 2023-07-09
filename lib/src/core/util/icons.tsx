import React from "react";
import * as mui from "@mui/icons-material";

import { CMSView, EntityCollection } from "../../types";
import { hashString } from "./hash";

export function getIcon(iconKey?: string, props?: any): React.ReactElement | undefined {
    if (!iconKey) return undefined;
    return iconKey in mui ? React.createElement(mui[iconKey as keyof typeof mui], props) : undefined;
}

export function getIconForView(collectionOrView: EntityCollection | CMSView, props?: any): React.ReactElement {
    const icon = getIcon(collectionOrView.icon, props);
    if (collectionOrView?.icon && icon)
        return icon;
    const iconsCount = collectionIconKeys.length;
    const key = collectionIconKeys[hashString(collectionOrView.path) % iconsCount] as keyof typeof mui
    return React.createElement(mui[key], props);
}

export const collectionIconKeys: string[] = ["AcUnit", "Adjust", "AlignHorizontalCenter", "Album", "AllInclusive", "AllOut", "Animation", "Assistant", "Attractions", "Audiotrack", "AutoAwesome", "AutoAwesomeMosaic", "BeachAccess", "Bolt", "Brightness1", "BreakfastDining", "BrokenImage", "Brightness5", "Cable", "CalendarViewMonth", "CatchingPokemon", "Casino", "Category", "Cloud", "ColorLens", "CreditCard", "Coronavirus", "Earbuds", "EggAlt", "FiberSmartRecord", "Flag", "Healing", "HeatPump", "Hive", "Hub", "LocalFireDepartment", "LocalPizza", "Memory", "Outlet", "Pages", "PanoramaPhotosphere", "SignalCellular0Bar", "SportsBaseball", "Storm", "Stairs"];
