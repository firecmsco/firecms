import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const _20mpIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"20mp"} ref={ref}/>
});

_20mpIcon.displayName = "_20mpIcon";
