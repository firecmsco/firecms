import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const PixIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"pix"} ref={ref}/>
});

PixIcon.displayName = "PixIcon";
