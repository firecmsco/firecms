import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const BusinessCenterIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"business_center"} ref={ref}/>
});

BusinessCenterIcon.displayName = "BusinessCenterIcon";
