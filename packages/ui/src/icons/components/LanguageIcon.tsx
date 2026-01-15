import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const LanguageIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"language"} ref={ref}/>
});

LanguageIcon.displayName = "LanguageIcon";
