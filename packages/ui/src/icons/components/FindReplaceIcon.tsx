import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const FindReplaceIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"find_replace"} ref={ref}/>
});

FindReplaceIcon.displayName = "FindReplaceIcon";
