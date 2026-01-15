import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const FemaleIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"female"} ref={ref}/>
});

FemaleIcon.displayName = "FemaleIcon";
