import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const WbAutoIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"wb_auto"} ref={ref}/>
});

WbAutoIcon.displayName = "WbAutoIcon";
