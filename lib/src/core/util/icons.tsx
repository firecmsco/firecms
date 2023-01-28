import * as mui from "@mui/icons-material";

import { CMSView, EntityCollection } from "../../types";
import { SvgIconTypeMap } from "@mui/material";
import { hashString } from "./hash";

export function getIcon(iconKey: string) {
    return mui[iconKey];
}

export function getIconForView(collectionOrView: EntityCollection | CMSView): React.ComponentType<SvgIconTypeMap["props"]> {
    if (collectionOrView?.icon && getIcon(collectionOrView.icon))
        return getIcon(collectionOrView.icon);
    const iconsCount = collectionIconKeys.length;
    return mui[collectionIconKeys[hashString(collectionOrView.path) % iconsCount]];
}

export const collectionIconKeys = ["AcUnit", "Adjust", "AlignHorizontalCenter", "Album", "AllInclusive", "AllOut", "Animation", "Assistant", "Attractions", "Audiotrack", "AutoAwesome", "AutoAwesomeMosaic", "BeachAccess", "Bolt", "Brightness1", "BreakfastDining", "BrokenImage", "Brightness5", "Cable", "CalendarViewMonth", "CatchingPokemon", "Casino", "Category", "Cloud", "ColorLens", "CreditCard", "Coronavirus", "Earbuds", "EggAlt", "FiberSmartRecord", "Flag", "Healing", "HeatPump", "Hive", "Hub", "LocalFireDepartment", "LocalPizza", "Memory", "Outlet", "Pages", "PanoramaPhotosphere", "SignalCellular0Bar", "SportsBaseball", "Storm", "Stairs"];
