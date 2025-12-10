import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const DownloadDoneIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"download_done"} ref={ref}/>
});

DownloadDoneIcon.displayName = "DownloadDoneIcon";
