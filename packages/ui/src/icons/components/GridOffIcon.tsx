import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const GridOffIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"grid_off"} ref={ref}/>
});

GridOffIcon.displayName = "GridOffIcon";
