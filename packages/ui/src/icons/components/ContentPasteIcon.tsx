import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const ContentPasteIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"content_paste"} ref={ref}/>
});

ContentPasteIcon.displayName = "ContentPasteIcon";
