import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const HomeIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"home"} ref={ref}/>
});

HomeIcon.displayName = "HomeIcon";
