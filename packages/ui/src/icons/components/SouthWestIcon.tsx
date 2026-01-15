import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const SouthWestIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"south_west"} ref={ref}/>
});

SouthWestIcon.displayName = "SouthWestIcon";
