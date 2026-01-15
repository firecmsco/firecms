import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const ViewComfortableIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"view_comfortable"} ref={ref}/>
});

ViewComfortableIcon.displayName = "ViewComfortableIcon";
