import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const Grid3x3Icon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"grid_3x3"} ref={ref}/>
});

Grid3x3Icon.displayName = "Grid3x3Icon";
