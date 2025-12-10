import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const PollIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"poll"} ref={ref}/>
});

PollIcon.displayName = "PollIcon";
