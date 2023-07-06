import clsx from "clsx";
import { cardMixin } from "../styles";

export function Card({
                         children,
                         style,
                         className,
                     }: {
    children: React.ReactNode;
    style?: React.CSSProperties;
    className?: string;

}) {
    return (
        <div
            className={clsx(cardMixin, className)}
            style={style}>
            {children}
        </div>
    )
}
