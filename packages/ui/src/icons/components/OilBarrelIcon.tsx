import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const OilBarrelIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"oil_barrel"} ref={ref}/>
});

OilBarrelIcon.displayName = "OilBarrelIcon";
