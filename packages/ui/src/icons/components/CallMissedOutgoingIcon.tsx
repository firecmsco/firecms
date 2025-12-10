import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const CallMissedOutgoingIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"call_missed_outgoing"} ref={ref}/>
});

CallMissedOutgoingIcon.displayName = "CallMissedOutgoingIcon";
