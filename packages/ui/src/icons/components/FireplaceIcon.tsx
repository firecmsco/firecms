import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const FireplaceIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"fireplace"} ref={ref}/>
});

FireplaceIcon.displayName = "FireplaceIcon";
