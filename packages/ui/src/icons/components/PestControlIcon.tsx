import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const PestControlIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"pest_control"} ref={ref}/>
});

PestControlIcon.displayName = "PestControlIcon";
