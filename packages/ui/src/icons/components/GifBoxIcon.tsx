import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const GifBoxIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"gif_box"} ref={ref}/>
});

GifBoxIcon.displayName = "GifBoxIcon";
