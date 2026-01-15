import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const RestorePageIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"restore_page"} ref={ref}/>
});

RestorePageIcon.displayName = "RestorePageIcon";
