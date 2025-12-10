import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const PestControlRodentIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"pest_control_rodent"} ref={ref}/>
});

PestControlRodentIcon.displayName = "PestControlRodentIcon";
