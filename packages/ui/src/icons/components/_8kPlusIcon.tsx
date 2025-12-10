import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const _8kPlusIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"8k_plus"} ref={ref}/>
});

_8kPlusIcon.displayName = "_8kPlusIcon";
