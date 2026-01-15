import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const BookmarkAddedIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"bookmark_added"} ref={ref}/>
});

BookmarkAddedIcon.displayName = "BookmarkAddedIcon";
