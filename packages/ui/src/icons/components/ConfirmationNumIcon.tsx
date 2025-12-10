import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const ConfirmationNumIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"confirmation_num"} ref={ref}/>
});

ConfirmationNumIcon.displayName = "ConfirmationNumIcon";
