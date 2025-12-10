import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const DownloadingIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"downloading"} ref={ref}/>
});

DownloadingIcon.displayName = "DownloadingIcon";
