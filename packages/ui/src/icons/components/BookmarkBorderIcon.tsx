import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const BookmarkBorderIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"bookmark_border"} ref={ref}/>
});

BookmarkBorderIcon.displayName = "BookmarkBorderIcon";
