import { cardMixin } from "../styles";
import { cn } from "./util/cn";

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
            className={cn(cardMixin, className)}
            style={style}>
            {children}
        </div>
    )
}
