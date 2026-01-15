import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const CodeOffIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"code_off"} ref={ref}/>
});

CodeOffIcon.displayName = "CodeOffIcon";
