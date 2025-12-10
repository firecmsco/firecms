import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const CopyIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"copy"} ref={ref}/>
});

CopyIcon.displayName = "CopyIcon";
