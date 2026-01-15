import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const EarbudsIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"earbuds"} ref={ref}/>
});

EarbudsIcon.displayName = "EarbudsIcon";
