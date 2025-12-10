import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const NightlightIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"nightlight"} ref={ref}/>
});

NightlightIcon.displayName = "NightlightIcon";
