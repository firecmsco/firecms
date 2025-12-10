import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const InvertColorsIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"invert_colors"} ref={ref}/>
});

InvertColorsIcon.displayName = "InvertColorsIcon";
