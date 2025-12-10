import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const PagesIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"pages"} ref={ref}/>
});

PagesIcon.displayName = "PagesIcon";
