import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const AutoFixHighIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"auto_fix_high"} ref={ref}/>
});

AutoFixHighIcon.displayName = "AutoFixHighIcon";
