import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const TranslateIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"translate"} ref={ref}/>
});

TranslateIcon.displayName = "TranslateIcon";
