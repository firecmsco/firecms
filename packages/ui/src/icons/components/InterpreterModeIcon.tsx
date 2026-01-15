import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const InterpreterModeIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"interpreter_mode"} ref={ref}/>
});

InterpreterModeIcon.displayName = "InterpreterModeIcon";
