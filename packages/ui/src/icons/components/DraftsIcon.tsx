import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const DraftsIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"drafts"} ref={ref}/>
});

DraftsIcon.displayName = "DraftsIcon";
