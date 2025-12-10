import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const ExposureNeg2Icon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"exposure_neg_2"} ref={ref}/>
});

ExposureNeg2Icon.displayName = "ExposureNeg2Icon";
