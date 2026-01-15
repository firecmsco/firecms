import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const DomainIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"domain"} ref={ref}/>
});

DomainIcon.displayName = "DomainIcon";
