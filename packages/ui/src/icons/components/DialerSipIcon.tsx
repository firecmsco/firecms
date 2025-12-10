import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const DialerSipIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"dialer_sip"} ref={ref}/>
});

DialerSipIcon.displayName = "DialerSipIcon";
