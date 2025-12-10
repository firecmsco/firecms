import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const DialpadIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"dialpad"} ref={ref}/>
});

DialpadIcon.displayName = "DialpadIcon";
