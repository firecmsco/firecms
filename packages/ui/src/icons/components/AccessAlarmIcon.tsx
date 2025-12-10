import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const AccessAlarmIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"access_alarm"} ref={ref}/>
});

AccessAlarmIcon.displayName = "AccessAlarmIcon";
