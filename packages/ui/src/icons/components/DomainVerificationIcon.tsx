import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const DomainVerificationIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"domain_verification"} ref={ref}/>
});

DomainVerificationIcon.displayName = "DomainVerificationIcon";
