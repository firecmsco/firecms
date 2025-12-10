import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const TextsmsIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"textsms"} ref={ref}/>
});

TextsmsIcon.displayName = "TextsmsIcon";
