import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const GetAppIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"get_app"} ref={ref}/>
});

GetAppIcon.displayName = "GetAppIcon";
