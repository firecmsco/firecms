import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const LiveHelpIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"live_help"} ref={ref}/>
});

LiveHelpIcon.displayName = "LiveHelpIcon";
