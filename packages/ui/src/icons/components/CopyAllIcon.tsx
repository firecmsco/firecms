import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const CopyAllIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"copy_all"} ref={ref}/>
});

CopyAllIcon.displayName = "CopyAllIcon";
