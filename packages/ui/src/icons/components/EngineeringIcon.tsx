import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const EngineeringIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"engineering"} ref={ref}/>
});

EngineeringIcon.displayName = "EngineeringIcon";
