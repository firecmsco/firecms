import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const BookmarkAddIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"bookmark_add"} ref={ref}/>
});

BookmarkAddIcon.displayName = "BookmarkAddIcon";
