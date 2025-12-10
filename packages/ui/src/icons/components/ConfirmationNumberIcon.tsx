import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const ConfirmationNumberIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"confirmation_number"} ref={ref}/>
});

ConfirmationNumberIcon.displayName = "ConfirmationNumberIcon";
