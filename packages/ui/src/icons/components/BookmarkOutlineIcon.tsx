import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const BookmarkOutlineIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"bookmark_outline"} ref={ref}/>
});

BookmarkOutlineIcon.displayName = "BookmarkOutlineIcon";
