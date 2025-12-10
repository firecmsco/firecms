import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const CardGiftcardIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"card_giftcard"} ref={ref}/>
});

CardGiftcardIcon.displayName = "CardGiftcardIcon";
