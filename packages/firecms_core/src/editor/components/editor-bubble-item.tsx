import { type ComponentPropsWithoutRef, type ReactNode, forwardRef } from "react";
import { Slot } from "@radix-ui/react-slot";
import { useProseMirrorContext } from "../hooks/useProseMirrorContext";

interface EditorBubbleItemProps {
  children: ReactNode;
  asChild?: boolean;
  onSelect?: () => void;
}

export const EditorBubbleItem = forwardRef<
  HTMLDivElement,
  EditorBubbleItemProps & Omit<ComponentPropsWithoutRef<"div">, "onSelect">
>(({ children, asChild, onSelect, ...rest }, ref) => {
  const { view } = useProseMirrorContext();
  const Comp = asChild ? Slot : "div";

  if (!view) return null;

  return (
    <Comp ref={ref} {...rest} onMouseDown={(e: React.MouseEvent) => {
      // Prevent default to avoid losing focus
      e.preventDefault();
    }} onClick={() => onSelect?.()}>
      {children}
    </Comp>
  );
});

EditorBubbleItem.displayName = "EditorBubbleItem";

export default EditorBubbleItem;
