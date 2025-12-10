import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const ExposureNeg1Icon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"exposure_neg_1"} ref={ref}/>
});

ExposureNeg1Icon.displayName = "ExposureNeg1Icon";
