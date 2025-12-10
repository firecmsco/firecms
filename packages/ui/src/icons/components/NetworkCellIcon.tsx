import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const NetworkCellIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"network_cell"} ref={ref}/>
});

NetworkCellIcon.displayName = "NetworkCellIcon";
