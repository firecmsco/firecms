import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const BackpackIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"backpack"} ref={ref}/>
});

BackpackIcon.displayName = "BackpackIcon";
