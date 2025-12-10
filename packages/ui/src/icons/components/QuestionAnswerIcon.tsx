import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const QuestionAnswerIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"question_answer"} ref={ref}/>
});

QuestionAnswerIcon.displayName = "QuestionAnswerIcon";
