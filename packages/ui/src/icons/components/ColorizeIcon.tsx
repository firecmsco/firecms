import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const ColorizeIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"colorize"} ref={ref}/>
});

ColorizeIcon.displayName = "ColorizeIcon";
