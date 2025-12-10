import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const ConnectWithoutContactIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"connect_without_contact"} ref={ref}/>
});

ConnectWithoutContactIcon.displayName = "ConnectWithoutContactIcon";
