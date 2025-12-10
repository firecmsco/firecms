import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const HomeMaxIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"home_max"} ref={ref}/>
});

HomeMaxIcon.displayName = "HomeMaxIcon";
