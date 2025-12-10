import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const EscalatorWarningIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"escalator_warning"} ref={ref}/>
});

EscalatorWarningIcon.displayName = "EscalatorWarningIcon";
