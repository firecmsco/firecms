import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const PortraitIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"portrait"} ref={ref}/>
});

PortraitIcon.displayName = "PortraitIcon";
