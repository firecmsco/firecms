import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const AutoFixOffIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"auto_fix_off"} ref={ref}/>
});

AutoFixOffIcon.displayName = "AutoFixOffIcon";
