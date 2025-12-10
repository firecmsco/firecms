import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const WorkOffIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"work_off"} ref={ref}/>
});

WorkOffIcon.displayName = "WorkOffIcon";
