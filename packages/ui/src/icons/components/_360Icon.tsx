import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const _360Icon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"360"} ref={ref}/>
});

_360Icon.displayName = "_360Icon";
