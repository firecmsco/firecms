import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const CallToActionIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"call_to_action"} ref={ref}/>
});

CallToActionIcon.displayName = "CallToActionIcon";
