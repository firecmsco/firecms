import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const AdUnitsIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"ad_units"} ref={ref}/>
});

AdUnitsIcon.displayName = "AdUnitsIcon";
