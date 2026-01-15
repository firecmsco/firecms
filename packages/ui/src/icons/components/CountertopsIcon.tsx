import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const CountertopsIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"countertops"} ref={ref}/>
});

CountertopsIcon.displayName = "CountertopsIcon";
