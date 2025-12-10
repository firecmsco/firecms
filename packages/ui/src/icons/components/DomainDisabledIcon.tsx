import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const DomainDisabledIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"domain_disabled"} ref={ref}/>
});

DomainDisabledIcon.displayName = "DomainDisabledIcon";
