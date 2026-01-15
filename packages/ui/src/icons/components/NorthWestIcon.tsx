import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const NorthWestIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"north_west"} ref={ref}/>
});

NorthWestIcon.displayName = "NorthWestIcon";
