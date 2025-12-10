import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const MotorcycleIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"motorcycle"} ref={ref}/>
});

MotorcycleIcon.displayName = "MotorcycleIcon";
