import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const HailIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"hail"} ref={ref}/>
});

HailIcon.displayName = "HailIcon";
