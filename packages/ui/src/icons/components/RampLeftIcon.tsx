import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const RampLeftIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"ramp_left"} ref={ref}/>
});

RampLeftIcon.displayName = "RampLeftIcon";
