import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const GrassIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"grass"} ref={ref}/>
});

GrassIcon.displayName = "GrassIcon";
