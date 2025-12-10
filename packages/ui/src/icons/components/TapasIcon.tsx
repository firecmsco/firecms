import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const TapasIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"tapas"} ref={ref}/>
});

TapasIcon.displayName = "TapasIcon";
