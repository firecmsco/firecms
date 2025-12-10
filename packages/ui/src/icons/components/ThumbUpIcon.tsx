import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const ThumbUpIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"thumb_up"} ref={ref}/>
});

ThumbUpIcon.displayName = "ThumbUpIcon";
