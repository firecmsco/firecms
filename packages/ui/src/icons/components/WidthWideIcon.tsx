import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const WidthWideIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"width_wide"} ref={ref}/>
});

WidthWideIcon.displayName = "WidthWideIcon";
