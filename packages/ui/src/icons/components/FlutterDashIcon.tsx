import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const FlutterDashIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"flutter_dash"} ref={ref}/>
});

FlutterDashIcon.displayName = "FlutterDashIcon";
