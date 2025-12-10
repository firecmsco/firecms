import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const TroubleshootIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"troubleshoot"} ref={ref}/>
});

TroubleshootIcon.displayName = "TroubleshootIcon";
