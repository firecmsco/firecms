import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const TempleHinduIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"temple_hindu"} ref={ref}/>
});

TempleHinduIcon.displayName = "TempleHinduIcon";
