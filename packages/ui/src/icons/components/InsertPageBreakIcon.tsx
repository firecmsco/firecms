import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const InsertPageBreakIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"insert_page_break"} ref={ref}/>
});

InsertPageBreakIcon.displayName = "InsertPageBreakIcon";
