import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const DinnerDiningIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"dinner_dining"} ref={ref}/>
});

DinnerDiningIcon.displayName = "DinnerDiningIcon";
