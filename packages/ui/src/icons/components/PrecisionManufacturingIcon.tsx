import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const PrecisionManufacturingIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"precision_manufacturing"} ref={ref}/>
});

PrecisionManufacturingIcon.displayName = "PrecisionManufacturingIcon";
