import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const Brightness1Icon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"brightness_1"} ref={ref}/>
});

Brightness1Icon.displayName = "Brightness1Icon";
