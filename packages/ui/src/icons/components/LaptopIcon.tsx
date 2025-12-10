import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const LaptopIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"laptop"} ref={ref}/>
});

LaptopIcon.displayName = "LaptopIcon";
