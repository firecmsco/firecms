import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const EuroIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"euro"} ref={ref}/>
});

EuroIcon.displayName = "EuroIcon";
