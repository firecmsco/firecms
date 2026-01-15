import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const LocalPrintshopIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"local_printshop"} ref={ref}/>
});

LocalPrintshopIcon.displayName = "LocalPrintshopIcon";
