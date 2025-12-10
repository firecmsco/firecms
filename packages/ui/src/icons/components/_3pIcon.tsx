import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const _3pIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"3p"} ref={ref}/>
});

_3pIcon.displayName = "_3pIcon";
