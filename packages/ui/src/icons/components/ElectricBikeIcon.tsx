import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const ElectricBikeIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"electric_bike"} ref={ref}/>
});

ElectricBikeIcon.displayName = "ElectricBikeIcon";
