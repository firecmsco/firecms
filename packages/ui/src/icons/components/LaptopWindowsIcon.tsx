import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const LaptopWindowsIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"laptop_windows"} ref={ref}/>
});

LaptopWindowsIcon.displayName = "LaptopWindowsIcon";
