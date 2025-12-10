import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const MacroOffIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"macro_off"} ref={ref}/>
});

MacroOffIcon.displayName = "MacroOffIcon";
