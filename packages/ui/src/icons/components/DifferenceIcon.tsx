import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const DifferenceIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"difference"} ref={ref}/>
});

DifferenceIcon.displayName = "DifferenceIcon";
