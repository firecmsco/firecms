import React from "react";

export type LazyVideoProps = Omit<React.VideoHTMLAttributes<HTMLVideoElement>, "src"> & {
    src: string;
};

export const LazyVideo: React.FC<LazyVideoProps> = ({
                                                 src,
                                                 ...rest
                                             }) => {
    const ref = React.useRef<HTMLVideoElement>(null);
    const [isVisible, setIsVisible] = React.useState(false);

    React.useEffect(() => {
        const el = ref.current;
        if (!el) return () => {
        };

        if ("IntersectionObserver" in window) {
            const obs = new IntersectionObserver(
                (entries) => {
                    if (entries.some((e) => e.isIntersecting)) {
                        setIsVisible(true);
                        obs.disconnect();
                    }
                },
                {
                    rootMargin: "200px 0px",
                    threshold: 0.1
                }
            );
            obs.observe(el);
            return () => obs.disconnect();
        } else {
            setIsVisible(true);
            return () => {
            };
        }
    }, []);

    React.useEffect(() => {
        if (isVisible && ref.current) {
            ref.current.play().catch(() => {
            });
        }
    }, [isVisible]);

    return (
        <video
            ref={ref}
            preload="none"
            {...rest}
            src={isVisible ? src : undefined}
        />
    );
};
