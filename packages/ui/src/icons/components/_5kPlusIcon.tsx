import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const _5kPlusIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"5k_plus"} ref={ref}/>
});

_5kPlusIcon.displayName = "_5kPlusIcon";
