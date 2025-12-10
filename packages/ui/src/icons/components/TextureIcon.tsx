import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const TextureIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"texture"} ref={ref}/>
});

TextureIcon.displayName = "TextureIcon";
