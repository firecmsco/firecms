import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const SupportAgentIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"support_agent"} ref={ref}/>
});

SupportAgentIcon.displayName = "SupportAgentIcon";
