import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const AccessTimeFilledIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"access_time_filled"} ref={ref}/>
});

AccessTimeFilledIcon.displayName = "AccessTimeFilledIcon";
