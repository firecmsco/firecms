import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const ScheduleSendIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"schedule_send"} ref={ref}/>
});

ScheduleSendIcon.displayName = "ScheduleSendIcon";
