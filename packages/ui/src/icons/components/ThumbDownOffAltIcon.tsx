import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const ThumbDownOffAltIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"thumb_down_off_alt"} ref={ref}/>
});

ThumbDownOffAltIcon.displayName = "ThumbDownOffAltIcon";
