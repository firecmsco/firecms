import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const MinimizeIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"minimize"} ref={ref}/>
});

MinimizeIcon.displayName = "MinimizeIcon";
