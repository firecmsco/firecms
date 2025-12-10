import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const PaletteIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"palette"} ref={ref}/>
});

PaletteIcon.displayName = "PaletteIcon";
