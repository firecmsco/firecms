import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const ThumbDownIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"thumb_down"} ref={ref}/>
});

ThumbDownIcon.displayName = "ThumbDownIcon";
