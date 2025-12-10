import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const LandscapeIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"landscape"} ref={ref}/>
});

LandscapeIcon.displayName = "LandscapeIcon";
