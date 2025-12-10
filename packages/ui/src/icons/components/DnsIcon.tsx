import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const DnsIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"dns"} ref={ref}/>
});

DnsIcon.displayName = "DnsIcon";
