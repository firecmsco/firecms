import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const LightIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"light"} ref={ref}/>
});

LightIcon.displayName = "LightIcon";
