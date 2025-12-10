import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const FluorescentIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"fluorescent"} ref={ref}/>
});

FluorescentIcon.displayName = "FluorescentIcon";
