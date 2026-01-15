import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const QuizIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"quiz"} ref={ref}/>
});

QuizIcon.displayName = "QuizIcon";
