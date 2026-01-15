import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const OpenInNewOffIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"open_in_new_off"} ref={ref}/>
});

OpenInNewOffIcon.displayName = "OpenInNewOffIcon";
