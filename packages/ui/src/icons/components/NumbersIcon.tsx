import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const NumbersIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"numbers"} ref={ref}/>
});

NumbersIcon.displayName = "NumbersIcon";
