import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const SignLanguageIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"sign_language"} ref={ref}/>
});

SignLanguageIcon.displayName = "SignLanguageIcon";
