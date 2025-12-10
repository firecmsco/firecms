import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const PageviewIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"pageview"} ref={ref}/>
});

PageviewIcon.displayName = "PageviewIcon";
