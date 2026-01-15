import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const PhoneMissedIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"phone_missed"} ref={ref}/>
});

PhoneMissedIcon.displayName = "PhoneMissedIcon";
