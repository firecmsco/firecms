import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const PhonelinkIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"phonelink"} ref={ref}/>
});

PhonelinkIcon.displayName = "PhonelinkIcon";
