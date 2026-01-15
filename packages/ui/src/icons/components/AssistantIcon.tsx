import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const AssistantIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"assistant"} ref={ref}/>
});

AssistantIcon.displayName = "AssistantIcon";
