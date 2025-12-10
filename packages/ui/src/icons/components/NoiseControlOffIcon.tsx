import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const NoiseControlOffIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"noise_control_off"} ref={ref}/>
});

NoiseControlOffIcon.displayName = "NoiseControlOffIcon";
