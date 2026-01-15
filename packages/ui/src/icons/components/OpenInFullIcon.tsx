import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const OpenInFullIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"open_in_full"} ref={ref}/>
});

OpenInFullIcon.displayName = "OpenInFullIcon";
