import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const _5mpIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"5mp"} ref={ref}/>
});

_5mpIcon.displayName = "_5mpIcon";
