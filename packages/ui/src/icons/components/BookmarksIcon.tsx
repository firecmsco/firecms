import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const BookmarksIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"bookmarks"} ref={ref}/>
});

BookmarksIcon.displayName = "BookmarksIcon";
