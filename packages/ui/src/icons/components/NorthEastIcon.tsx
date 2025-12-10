import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const NorthEastIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"north_east"} ref={ref}/>
});

NorthEastIcon.displayName = "NorthEastIcon";
