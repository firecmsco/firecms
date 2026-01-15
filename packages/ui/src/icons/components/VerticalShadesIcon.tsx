import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const VerticalShadesIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"vertical_shades"} ref={ref}/>
});

VerticalShadesIcon.displayName = "VerticalShadesIcon";
