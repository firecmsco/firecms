import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const _3mpIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"3mp"} ref={ref}/>
});

_3mpIcon.displayName = "_3mpIcon";
