import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const SimCardIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"sim_card"} ref={ref}/>
});

SimCardIcon.displayName = "SimCardIcon";
