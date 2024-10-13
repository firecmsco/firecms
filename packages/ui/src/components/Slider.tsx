import * as React from "react"
import { cls } from "../util";
import * as SliderPrimitive from "@radix-ui/react-slider";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";

export interface SliderProps {
    className?: string;
    name?: string;
    disabled?: boolean;
    orientation?: React.AriaAttributes["aria-orientation"];
    dir?: "ltr" | "rtl";
    min?: number;
    max?: number;
    step?: number;
    minStepsBetweenThumbs?: number;
    value?: number[];
    defaultValue?: number[];

    onValueChange?(value: number[]): void;

    onValueCommit?(value: number[]): void;

    inverted?: boolean;
    form?: string;
}

const Slider = React.forwardRef<
    React.ElementRef<typeof SliderPrimitive.Root>,
    SliderProps
>(({
       className,
       ...props
   }, ref) => {
    const [hovered, setHovered] = React.useState(false);
    return (
        <TooltipPrimitive.Provider delayDuration={200}>
            <TooltipPrimitive.Root open={hovered}>
                <SliderPrimitive.Root
                    ref={ref}
                    onMouseEnter={() => setHovered(true)}
                    onMouseLeave={() => setHovered(false)}
                    className={cls(
                        "relative flex w-full touch-none select-none items-center",
                        className
                    )}
                    {...props}
                >
                    <SliderPrimitive.Track
                        className="relative h-2 w-full grow overflow-hidden rounded-full bg-slate-300 bg-opacity-40 dark:bg-gray-700 dark:bg-opacity-40">
                        <SliderPrimitive.Range className={cls("absolute h-full",
                            {
                                "bg-primary": !props.disabled,
                                "bg-slate-300 dark:bg-gray-700": props.disabled
                            })}/>
                    </SliderPrimitive.Track>
                    <TooltipPrimitive.Trigger asChild>
                        <SliderPrimitive.Thumb
                            className={cls({
                                "border-primary bg-primary hover:bg-primary-dark ring-offset-primary focus-visible:ring-2 focus-visible:ring-primary ": !props.disabled,
                                "border-slate-300 bg-slate-300 dark:border-gray-700 dark:bg-gray-700": props.disabled
                            }, "block h-6 w-6 rounded-full  transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50")}/>
                    </TooltipPrimitive.Trigger>
                    <TooltipPrimitive.Content side="top" sideOffset={5}
                                              className={cls(
                                                  "TooltipContent",
                                                  "max-w-lg leading-relaxed",
                                                  "z-50 rounded px-3 py-2 text-xs leading-none bg-slate-700 dark:bg-slate-800 bg-opacity-90 font-medium text-slate-50 shadow-2xl select-none duration-400 ease-in transform opacity-100",
                                              )}>
                        {props.value?.[0]}
                    </TooltipPrimitive.Content>

                </SliderPrimitive.Root>
            </TooltipPrimitive.Root>
        </TooltipPrimitive.Provider>
    );
});

Slider.displayName = "Slider";

export { Slider }
