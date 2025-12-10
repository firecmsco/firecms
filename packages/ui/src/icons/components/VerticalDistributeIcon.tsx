import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const VerticalDistributeIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"vertical_distribute"} ref={ref}/>
});

VerticalDistributeIcon.displayName = "VerticalDistributeIcon";
