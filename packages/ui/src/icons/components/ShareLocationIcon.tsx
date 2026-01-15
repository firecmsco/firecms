import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const ShareLocationIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"share_location"} ref={ref}/>
});

ShareLocationIcon.displayName = "ShareLocationIcon";
