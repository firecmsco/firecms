import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const BlurOnIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"blur_on"} ref={ref}/>
});

BlurOnIcon.displayName = "BlurOnIcon";
