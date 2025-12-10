import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const FirstPageIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"first_page"} ref={ref}/>
});

FirstPageIcon.displayName = "FirstPageIcon";
