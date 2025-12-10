import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const ForestIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"forest"} ref={ref}/>
});

ForestIcon.displayName = "ForestIcon";
