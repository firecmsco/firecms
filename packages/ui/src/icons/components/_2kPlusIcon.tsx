import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const _2kPlusIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"2k_plus"} ref={ref}/>
});

_2kPlusIcon.displayName = "_2kPlusIcon";
