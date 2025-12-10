import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const SnippetFolderIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"snippet_folder"} ref={ref}/>
});

SnippetFolderIcon.displayName = "SnippetFolderIcon";
