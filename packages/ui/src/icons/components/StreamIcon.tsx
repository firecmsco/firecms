import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const StreamIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"stream"} ref={ref}/>
});

StreamIcon.displayName = "StreamIcon";
