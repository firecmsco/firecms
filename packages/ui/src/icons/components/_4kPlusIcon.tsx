import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const _4kPlusIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"4k_plus"} ref={ref}/>
});

_4kPlusIcon.displayName = "_4kPlusIcon";
