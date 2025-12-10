import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const ContentCutIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"content_cut"} ref={ref}/>
});

ContentCutIcon.displayName = "ContentCutIcon";
