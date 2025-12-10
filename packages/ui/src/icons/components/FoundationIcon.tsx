import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const FoundationIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"foundation"} ref={ref}/>
});

FoundationIcon.displayName = "FoundationIcon";
