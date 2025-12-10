import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const FaxIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"fax"} ref={ref}/>
});

FaxIcon.displayName = "FaxIcon";
