import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const MobileFriendlyIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"mobile_friendly"} ref={ref}/>
});

MobileFriendlyIcon.displayName = "MobileFriendlyIcon";
