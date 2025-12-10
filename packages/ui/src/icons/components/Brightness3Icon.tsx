import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const Brightness3Icon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"brightness_3"} ref={ref}/>
});

Brightness3Icon.displayName = "Brightness3Icon";
