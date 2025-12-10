import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const CancelScheduleSendIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"cancel_schedule_send"} ref={ref}/>
});

CancelScheduleSendIcon.displayName = "CancelScheduleSendIcon";
