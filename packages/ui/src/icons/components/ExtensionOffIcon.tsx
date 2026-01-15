import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const ExtensionOffIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"extension_off"} ref={ref}/>
});

ExtensionOffIcon.displayName = "ExtensionOffIcon";
