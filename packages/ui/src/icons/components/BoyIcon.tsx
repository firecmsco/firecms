import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const BoyIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"boy"} ref={ref}/>
});

BoyIcon.displayName = "BoyIcon";
