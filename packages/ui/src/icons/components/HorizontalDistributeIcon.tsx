import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const HorizontalDistributeIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"horizontal_distribute"} ref={ref}/>
});

HorizontalDistributeIcon.displayName = "HorizontalDistributeIcon";
