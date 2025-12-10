import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const StrikethroughSIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"strikethrough_s"} ref={ref}/>
});

StrikethroughSIcon.displayName = "StrikethroughSIcon";
