import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const _10mpIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"10mp"} ref={ref}/>
});

_10mpIcon.displayName = "_10mpIcon";
