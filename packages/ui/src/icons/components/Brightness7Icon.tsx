import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const Brightness7Icon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"brightness_7"} ref={ref}/>
});

Brightness7Icon.displayName = "Brightness7Icon";
