import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const CarCrashIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"car_crash"} ref={ref}/>
});

CarCrashIcon.displayName = "CarCrashIcon";
