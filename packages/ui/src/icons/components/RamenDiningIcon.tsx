import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const RamenDiningIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"ramen_dining"} ref={ref}/>
});

RamenDiningIcon.displayName = "RamenDiningIcon";
