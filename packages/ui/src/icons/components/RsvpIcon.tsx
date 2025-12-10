import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const RsvpIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"rsvp"} ref={ref}/>
});

RsvpIcon.displayName = "RsvpIcon";
