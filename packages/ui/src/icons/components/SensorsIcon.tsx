import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const SensorsIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"sensors"} ref={ref}/>
});

SensorsIcon.displayName = "SensorsIcon";
