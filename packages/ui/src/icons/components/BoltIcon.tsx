import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const BoltIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"bolt"} ref={ref}/>
});

BoltIcon.displayName = "BoltIcon";
