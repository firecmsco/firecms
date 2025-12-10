import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const PhoneInTalkIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"phone_in_talk"} ref={ref}/>
});

PhoneInTalkIcon.displayName = "PhoneInTalkIcon";
