import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const SouthEastIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"south_east"} ref={ref}/>
});

SouthEastIcon.displayName = "SouthEastIcon";
