import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const QuestionMarkIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"question_mark"} ref={ref}/>
});

QuestionMarkIcon.displayName = "QuestionMarkIcon";
