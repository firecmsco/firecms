import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const SupervisorAccountIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"supervisor_account"} ref={ref}/>
});

SupervisorAccountIcon.displayName = "SupervisorAccountIcon";
