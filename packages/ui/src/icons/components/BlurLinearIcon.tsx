import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const BlurLinearIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"blur_linear"} ref={ref}/>
});

BlurLinearIcon.displayName = "BlurLinearIcon";
