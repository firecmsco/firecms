import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const ThumbDownAltIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"thumb_down_alt"} ref={ref}/>
});

ThumbDownAltIcon.displayName = "ThumbDownAltIcon";
