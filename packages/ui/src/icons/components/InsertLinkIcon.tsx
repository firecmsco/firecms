import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const InsertLinkIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"insert_link"} ref={ref}/>
});

InsertLinkIcon.displayName = "InsertLinkIcon";
