import PlaylistPlay from "@mui/icons-material/PlaylistPlay";
import ShowChartIcon from "@mui/icons-material/ShowChart";

import * as mui from "@mui/icons-material";

import { CMSView, EntityCollection } from "../../models";
import { SvgIconTypeMap } from "@mui/material";

export function getIconForView(collectionOrView?: EntityCollection | CMSView): React.ComponentType<SvgIconTypeMap["props"]> {
    if (collectionOrView?.icon && mui[collectionOrView.icon])
        return mui[collectionOrView.icon];
    return collectionOrView?.path ? PlaylistPlay : ShowChartIcon;
}
