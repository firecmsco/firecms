import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const HandshakeIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"handshake"} ref={ref}/>
});

HandshakeIcon.displayName = "HandshakeIcon";
