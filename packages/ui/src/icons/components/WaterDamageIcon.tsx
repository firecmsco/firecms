import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const WaterDamageIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"water_damage"} ref={ref}/>
});

WaterDamageIcon.displayName = "WaterDamageIcon";
