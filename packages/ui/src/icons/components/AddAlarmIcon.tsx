import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const AddAlarmIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"add_alarm"} ref={ref}/>
});

AddAlarmIcon.displayName = "AddAlarmIcon";
