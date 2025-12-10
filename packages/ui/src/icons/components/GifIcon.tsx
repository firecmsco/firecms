import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const GifIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"gif"} ref={ref}/>
});

GifIcon.displayName = "GifIcon";
