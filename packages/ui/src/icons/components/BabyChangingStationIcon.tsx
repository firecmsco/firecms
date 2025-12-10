import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const BabyChangingStationIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"baby_changing_station"} ref={ref}/>
});

BabyChangingStationIcon.displayName = "BabyChangingStationIcon";
