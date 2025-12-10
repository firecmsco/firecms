import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const FreeBreakfastIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"free_breakfast"} ref={ref}/>
});

FreeBreakfastIcon.displayName = "FreeBreakfastIcon";
