import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const FlourescentIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"flourescent"} ref={ref}/>
});

FlourescentIcon.displayName = "FlourescentIcon";
