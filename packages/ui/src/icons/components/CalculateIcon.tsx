import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const CalculateIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"calculate"} ref={ref}/>
});

CalculateIcon.displayName = "CalculateIcon";
