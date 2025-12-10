import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const ThumbUpOffAltIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"thumb_up_off_alt"} ref={ref}/>
});

ThumbUpOffAltIcon.displayName = "ThumbUpOffAltIcon";
