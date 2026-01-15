import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const _2mpIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"2mp"} ref={ref}/>
});

_2mpIcon.displayName = "_2mpIcon";
