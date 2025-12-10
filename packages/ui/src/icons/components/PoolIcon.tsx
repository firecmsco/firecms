import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const PoolIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"pool"} ref={ref}/>
});

PoolIcon.displayName = "PoolIcon";
