import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const HubIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"hub"} ref={ref}/>
});

HubIcon.displayName = "HubIcon";
