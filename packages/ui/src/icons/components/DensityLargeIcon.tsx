import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const DensityLargeIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"density_large"} ref={ref}/>
});

DensityLargeIcon.displayName = "DensityLargeIcon";
