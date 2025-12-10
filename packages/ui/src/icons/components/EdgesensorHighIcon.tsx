import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const EdgesensorHighIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"edgesensor_high"} ref={ref}/>
});

EdgesensorHighIcon.displayName = "EdgesensorHighIcon";
