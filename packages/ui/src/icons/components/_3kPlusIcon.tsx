import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const _3kPlusIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"3k_plus"} ref={ref}/>
});

_3kPlusIcon.displayName = "_3kPlusIcon";
