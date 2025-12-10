import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const RampRightIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"ramp_right"} ref={ref}/>
});

RampRightIcon.displayName = "RampRightIcon";
