import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const ContentPasteOffIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"content_paste_off"} ref={ref}/>
});

ContentPasteOffIcon.displayName = "ContentPasteOffIcon";
