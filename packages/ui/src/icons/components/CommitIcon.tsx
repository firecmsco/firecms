import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const CommitIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"commit"} ref={ref}/>
});

CommitIcon.displayName = "CommitIcon";
