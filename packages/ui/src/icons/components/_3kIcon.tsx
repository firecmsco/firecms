import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const _3kIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"3k"} ref={ref}/>
});

_3kIcon.displayName = "_3kIcon";
