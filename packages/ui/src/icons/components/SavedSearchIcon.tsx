import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const SavedSearchIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"saved_search"} ref={ref}/>
});

SavedSearchIcon.displayName = "SavedSearchIcon";
