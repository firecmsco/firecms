import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const DatabaseIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"database"} ref={ref}/>
});

DatabaseIcon.displayName = "DatabaseIcon";
