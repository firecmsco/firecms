import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const MediationIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"mediation"} ref={ref}/>
});

MediationIcon.displayName = "MediationIcon";
