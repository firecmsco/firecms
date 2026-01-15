import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const MessengerOutlineIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"messenger_outline"} ref={ref}/>
});

MessengerOutlineIcon.displayName = "MessengerOutlineIcon";
