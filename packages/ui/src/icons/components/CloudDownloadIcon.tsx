import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const CloudDownloadIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"cloud_download"} ref={ref}/>
});

CloudDownloadIcon.displayName = "CloudDownloadIcon";
