import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const AutoFixNormalIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"auto_fix_normal"} ref={ref}/>
});

AutoFixNormalIcon.displayName = "AutoFixNormalIcon";
