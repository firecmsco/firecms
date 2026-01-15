import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const PhonelinkRingIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"phonelink_ring"} ref={ref}/>
});

PhonelinkRingIcon.displayName = "PhonelinkRingIcon";
