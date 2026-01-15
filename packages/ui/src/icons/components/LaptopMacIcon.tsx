import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const LaptopMacIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"laptop_mac"} ref={ref}/>
});

LaptopMacIcon.displayName = "LaptopMacIcon";
