import PlaylistPlay from "@mui/icons-material/PlaylistPlay";
import ShowChartIcon from "@mui/icons-material/ShowChart";

import * as mui from "@mui/icons-material";

import { CMSView, EntityCollection } from "../../types";
import { SvgIconTypeMap } from "@mui/material";

export function getIcon(iconKey:string) {
    return mui[iconKey];
}
export function getIconForView(collectionOrView?: EntityCollection | CMSView): React.ComponentType<SvgIconTypeMap["props"]> {
    if (collectionOrView?.icon && getIcon(collectionOrView.icon))
        return getIcon(collectionOrView.icon);
    return collectionOrView?.path ? PlaylistPlay : ShowChartIcon;
}
