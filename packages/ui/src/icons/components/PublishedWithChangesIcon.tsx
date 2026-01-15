import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const PublishedWithChangesIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"published_with_changes"} ref={ref}/>
});

PublishedWithChangesIcon.displayName = "PublishedWithChangesIcon";
