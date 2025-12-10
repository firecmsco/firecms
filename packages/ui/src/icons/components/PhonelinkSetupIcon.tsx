import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const PhonelinkSetupIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"phonelink_setup"} ref={ref}/>
});

PhonelinkSetupIcon.displayName = "PhonelinkSetupIcon";
