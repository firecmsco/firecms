import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const GridViewIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"grid_view"} ref={ref}/>
});

GridViewIcon.displayName = "GridViewIcon";
