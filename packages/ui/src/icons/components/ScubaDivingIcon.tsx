import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const ScubaDivingIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"scuba_diving"} ref={ref}/>
});

ScubaDivingIcon.displayName = "ScubaDivingIcon";
