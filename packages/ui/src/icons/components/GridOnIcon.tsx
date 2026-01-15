import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const GridOnIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"grid_on"} ref={ref}/>
});

GridOnIcon.displayName = "GridOnIcon";
