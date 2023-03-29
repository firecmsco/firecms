import * as mui from "@mui/icons-material";

import { CMSView, EntityCollection } from "../../types";
import { SvgIconTypeMap } from "@mui/material";
import { hashString } from "./hash";

export function getIcon(iconKey?: string) {
    if (!iconKey) return undefined;
    return iconKey in mui ? mui[iconKey as keyof typeof mui] : undefined;
}

export function getIconForView(collectionOrView: EntityCollection | CMSView): React.ComponentType<SvgIconTypeMap["props"]> {
    const icon = getIcon(collectionOrView.icon);
    if (collectionOrView?.icon && icon)
        return icon;
    const iconsCount = collectionIconKeys.length;
    const key = collectionIconKeys[hashString(collectionOrView.path) % iconsCount] as keyof typeof mui
    return mui[key];
}

export const collectionIconKeys:string[] = ["AcUnit", "Adjust", "AlignHorizontalCenter", "Album", "AllInclusive", "AllOut", "Animation", "Assistant", "Attractions", "Audiotrack", "AutoAwesome", "AutoAwesomeMosaic", "BeachAccess", "Bolt", "Brightness1", "BreakfastDining", "BrokenImage", "Brightness5", "Cable", "CalendarViewMonth", "CatchingPokemon", "Casino", "Category", "Cloud", "ColorLens", "CreditCard", "Coronavirus", "Earbuds", "EggAlt", "FiberSmartRecord", "Flag", "Healing", "HeatPump", "Hive", "Hub", "LocalFireDepartment", "LocalPizza", "Memory", "Outlet", "Pages", "PanoramaPhotosphere", "SignalCellular0Bar", "SportsBaseball", "Storm", "Stairs"];
