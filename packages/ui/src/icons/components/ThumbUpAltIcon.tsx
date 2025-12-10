import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const ThumbUpAltIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"thumb_up_alt"} ref={ref}/>
});

ThumbUpAltIcon.displayName = "ThumbUpAltIcon";
