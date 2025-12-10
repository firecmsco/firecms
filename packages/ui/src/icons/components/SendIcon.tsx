import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const SendIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"send"} ref={ref}/>
});

SendIcon.displayName = "SendIcon";
