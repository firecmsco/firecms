import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const FindInPageIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"find_in_page"} ref={ref}/>
});

FindInPageIcon.displayName = "FindInPageIcon";
