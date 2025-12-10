import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const AutoGraphIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"auto_graph"} ref={ref}/>
});

AutoGraphIcon.displayName = "AutoGraphIcon";
