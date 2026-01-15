import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const FitbitIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"fitbit"} ref={ref}/>
});

FitbitIcon.displayName = "FitbitIcon";
