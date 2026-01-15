import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const HdIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"hd"} ref={ref}/>
});

HdIcon.displayName = "HdIcon";
