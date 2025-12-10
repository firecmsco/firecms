import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const AnchorIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"anchor"} ref={ref}/>
});

AnchorIcon.displayName = "AnchorIcon";
