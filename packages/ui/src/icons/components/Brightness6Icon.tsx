import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const Brightness6Icon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"brightness_6"} ref={ref}/>
});

Brightness6Icon.displayName = "Brightness6Icon";
