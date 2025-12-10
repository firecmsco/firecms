import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const WbCloudyIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"wb_cloudy"} ref={ref}/>
});

WbCloudyIcon.displayName = "WbCloudyIcon";
