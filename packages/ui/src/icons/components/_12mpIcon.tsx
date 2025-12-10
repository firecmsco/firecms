import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const _12mpIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"12mp"} ref={ref}/>
});

_12mpIcon.displayName = "_12mpIcon";
