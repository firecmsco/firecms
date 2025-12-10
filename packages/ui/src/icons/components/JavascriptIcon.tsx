import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const JavascriptIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"javascript"} ref={ref}/>
});

JavascriptIcon.displayName = "JavascriptIcon";
