import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const WidthFullIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"width_full"} ref={ref}/>
});

WidthFullIcon.displayName = "WidthFullIcon";
