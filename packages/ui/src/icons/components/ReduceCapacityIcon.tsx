import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const ReduceCapacityIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"reduce_capacity"} ref={ref}/>
});

ReduceCapacityIcon.displayName = "ReduceCapacityIcon";
