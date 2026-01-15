import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const InvertColorsOffIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"invert_colors_off"} ref={ref}/>
});

InvertColorsOffIcon.displayName = "InvertColorsOffIcon";
