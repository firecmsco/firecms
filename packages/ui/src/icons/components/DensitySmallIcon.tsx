import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const DensitySmallIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"density_small"} ref={ref}/>
});

DensitySmallIcon.displayName = "DensitySmallIcon";
