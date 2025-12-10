import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const VerticalShadesClosedIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"vertical_shades_closed"} ref={ref}/>
});

VerticalShadesClosedIcon.displayName = "VerticalShadesClosedIcon";
