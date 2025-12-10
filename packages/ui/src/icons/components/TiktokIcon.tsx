import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const TiktokIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"tiktok"} ref={ref}/>
});

TiktokIcon.displayName = "TiktokIcon";
