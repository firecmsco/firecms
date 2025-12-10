import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const BookmarkRemoveIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"bookmark_remove"} ref={ref}/>
});

BookmarkRemoveIcon.displayName = "BookmarkRemoveIcon";
