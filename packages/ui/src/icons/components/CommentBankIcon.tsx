import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const CommentBankIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"comment_bank"} ref={ref}/>
});

CommentBankIcon.displayName = "CommentBankIcon";
