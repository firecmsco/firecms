import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const ThumbsUpDownIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"thumbs_up_down"} ref={ref}/>
});

ThumbsUpDownIcon.displayName = "ThumbsUpDownIcon";
