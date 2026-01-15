import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const BookmarkIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"bookmark"} ref={ref}/>
});

BookmarkIcon.displayName = "BookmarkIcon";
