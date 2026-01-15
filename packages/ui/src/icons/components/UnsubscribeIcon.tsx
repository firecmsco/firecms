import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const UnsubscribeIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"unsubscribe"} ref={ref}/>
});

UnsubscribeIcon.displayName = "UnsubscribeIcon";
