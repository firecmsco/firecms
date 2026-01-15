import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const PercentIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"percent"} ref={ref}/>
});

PercentIcon.displayName = "PercentIcon";
