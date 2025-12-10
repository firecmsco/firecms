import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const ExposureZeroIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"exposure_zero"} ref={ref}/>
});

ExposureZeroIcon.displayName = "ExposureZeroIcon";
