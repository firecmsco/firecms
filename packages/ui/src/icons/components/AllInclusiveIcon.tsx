import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const AllInclusiveIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"all_inclusive"} ref={ref}/>
});

AllInclusiveIcon.displayName = "AllInclusiveIcon";
