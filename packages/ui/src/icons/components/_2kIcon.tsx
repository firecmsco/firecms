import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const _2kIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"2k"} ref={ref}/>
});

_2kIcon.displayName = "_2kIcon";
