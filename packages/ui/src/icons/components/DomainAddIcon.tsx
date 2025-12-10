import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const DomainAddIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"domain_add"} ref={ref}/>
});

DomainAddIcon.displayName = "DomainAddIcon";
