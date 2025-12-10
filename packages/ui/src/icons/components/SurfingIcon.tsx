import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const SurfingIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"surfing"} ref={ref}/>
});

SurfingIcon.displayName = "SurfingIcon";
