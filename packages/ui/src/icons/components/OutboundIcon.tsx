import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const OutboundIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"outbound"} ref={ref}/>
});

OutboundIcon.displayName = "OutboundIcon";
