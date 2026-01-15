import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const AlarmIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"alarm"} ref={ref}/>
});

AlarmIcon.displayName = "AlarmIcon";
