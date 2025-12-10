import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const DownloadForOfflineIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"download_for_offline"} ref={ref}/>
});

DownloadForOfflineIcon.displayName = "DownloadForOfflineIcon";
