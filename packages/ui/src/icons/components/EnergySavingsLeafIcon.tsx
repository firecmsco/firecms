import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const EnergySavingsLeafIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"energy_savings_leaf"} ref={ref}/>
});

EnergySavingsLeafIcon.displayName = "EnergySavingsLeafIcon";
