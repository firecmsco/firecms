import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const HomeWorkIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"home_work"} ref={ref}/>
});

HomeWorkIcon.displayName = "HomeWorkIcon";
