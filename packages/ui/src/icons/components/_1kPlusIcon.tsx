import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const _1kPlusIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"1k_plus"} ref={ref}/>
});

_1kPlusIcon.displayName = "_1kPlusIcon";
