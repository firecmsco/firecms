import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const TextSnippetIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"text_snippet"} ref={ref}/>
});

TextSnippetIcon.displayName = "TextSnippetIcon";
