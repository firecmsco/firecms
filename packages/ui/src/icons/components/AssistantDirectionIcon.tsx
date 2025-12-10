import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const AssistantDirectionIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"assistant_direction"} ref={ref}/>
});

AssistantDirectionIcon.displayName = "AssistantDirectionIcon";
