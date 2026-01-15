import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const StarOutlineIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"star_outline"} ref={ref}/>
});

StarOutlineIcon.displayName = "StarOutlineIcon";
