import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const _4mpIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"4mp"} ref={ref}/>
});

_4mpIcon.displayName = "_4mpIcon";
