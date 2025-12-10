import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const BookOnlineIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"book_online"} ref={ref}/>
});

BookOnlineIcon.displayName = "BookOnlineIcon";
