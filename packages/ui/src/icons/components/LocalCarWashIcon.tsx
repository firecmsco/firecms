import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const LocalCarWashIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"local_car_wash"} ref={ref}/>
});

LocalCarWashIcon.displayName = "LocalCarWashIcon";
