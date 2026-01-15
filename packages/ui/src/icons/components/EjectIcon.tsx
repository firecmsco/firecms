import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const EjectIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"eject"} ref={ref}/>
});

EjectIcon.displayName = "EjectIcon";
