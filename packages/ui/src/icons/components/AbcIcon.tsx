import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const AbcIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"abc"} ref={ref}/>
});

AbcIcon.displayName = "AbcIcon";
