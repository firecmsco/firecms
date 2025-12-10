import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const InsertEmoticonIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"insert_emoticon"} ref={ref}/>
});

InsertEmoticonIcon.displayName = "InsertEmoticonIcon";
