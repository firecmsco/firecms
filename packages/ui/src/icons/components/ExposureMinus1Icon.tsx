import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const ExposureMinus1Icon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"exposure_minus_1"} ref={ref}/>
});

ExposureMinus1Icon.displayName = "ExposureMinus1Icon";
