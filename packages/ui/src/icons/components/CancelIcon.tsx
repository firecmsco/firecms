import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const CancelIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"cancel"} ref={ref}/>
});

CancelIcon.displayName = "CancelIcon";
