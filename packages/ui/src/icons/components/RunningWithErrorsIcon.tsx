import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const RunningWithErrorsIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"running_with_errors"} ref={ref}/>
});

RunningWithErrorsIcon.displayName = "RunningWithErrorsIcon";
