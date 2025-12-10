import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const ExplicitIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"explicit"} ref={ref}/>
});

ExplicitIcon.displayName = "ExplicitIcon";
