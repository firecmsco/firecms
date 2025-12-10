import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const BedtimeOffIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"bedtime_off"} ref={ref}/>
});

BedtimeOffIcon.displayName = "BedtimeOffIcon";
