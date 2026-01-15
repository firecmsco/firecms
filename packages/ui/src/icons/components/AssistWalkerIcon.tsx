import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const AssistWalkerIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"assist_walker"} ref={ref}/>
});

AssistWalkerIcon.displayName = "AssistWalkerIcon";
