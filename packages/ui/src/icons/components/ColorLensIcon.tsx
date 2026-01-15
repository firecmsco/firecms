import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const ColorLensIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"color_lens"} ref={ref}/>
});

ColorLensIcon.displayName = "ColorLensIcon";
