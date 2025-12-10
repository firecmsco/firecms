import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const SickIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"sick"} ref={ref}/>
});

SickIcon.displayName = "SickIcon";
