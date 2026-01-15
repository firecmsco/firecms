import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const DensityMediumIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"density_medium"} ref={ref}/>
});

DensityMediumIcon.displayName = "DensityMediumIcon";
