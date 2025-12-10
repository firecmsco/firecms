import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const ExposureMinus2Icon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"exposure_minus_2"} ref={ref}/>
});

ExposureMinus2Icon.displayName = "ExposureMinus2Icon";
