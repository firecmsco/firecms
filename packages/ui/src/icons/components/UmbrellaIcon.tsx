import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const UmbrellaIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"umbrella"} ref={ref}/>
});

UmbrellaIcon.displayName = "UmbrellaIcon";
