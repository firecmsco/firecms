import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const PhonelinkEraseIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"phonelink_erase"} ref={ref}/>
});

PhonelinkEraseIcon.displayName = "PhonelinkEraseIcon";
