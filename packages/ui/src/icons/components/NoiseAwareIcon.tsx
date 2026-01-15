import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const NoiseAwareIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"noise_aware"} ref={ref}/>
});

NoiseAwareIcon.displayName = "NoiseAwareIcon";
