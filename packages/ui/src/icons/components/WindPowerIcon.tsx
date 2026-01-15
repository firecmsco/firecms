import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const WindPowerIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"wind_power"} ref={ref}/>
});

WindPowerIcon.displayName = "WindPowerIcon";
