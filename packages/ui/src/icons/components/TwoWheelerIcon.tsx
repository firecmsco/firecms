import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const TwoWheelerIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"two_wheeler"} ref={ref}/>
});

TwoWheelerIcon.displayName = "TwoWheelerIcon";
