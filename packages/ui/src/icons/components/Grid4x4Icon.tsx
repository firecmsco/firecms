import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const Grid4x4Icon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"grid_4x4"} ref={ref}/>
});

Grid4x4Icon.displayName = "Grid4x4Icon";
