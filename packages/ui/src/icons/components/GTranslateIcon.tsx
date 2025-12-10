import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const GTranslateIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"g_translate"} ref={ref}/>
});

GTranslateIcon.displayName = "GTranslateIcon";
