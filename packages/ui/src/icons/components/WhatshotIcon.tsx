import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const WhatshotIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"whatshot"} ref={ref}/>
});

WhatshotIcon.displayName = "WhatshotIcon";
