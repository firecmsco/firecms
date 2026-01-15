import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const InvertColorsOnIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"invert_colors_on"} ref={ref}/>
});

InvertColorsOnIcon.displayName = "InvertColorsOnIcon";
