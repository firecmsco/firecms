import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const DownloadIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"download"} ref={ref}/>
});

DownloadIcon.displayName = "DownloadIcon";
