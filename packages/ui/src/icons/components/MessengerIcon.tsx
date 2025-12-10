import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const MessengerIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"messenger"} ref={ref}/>
});

MessengerIcon.displayName = "MessengerIcon";
