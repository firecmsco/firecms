import React, { useEffect, useRef } from 'react';

interface SlideshowProps {
    images: string[];
    speed?: number; // Speed in pixels per frame
}

export const Slideshow: React.FC<SlideshowProps> = ({ images, speed = 1 }) => {
    const slideshowContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const slideshowContainer = slideshowContainerRef.current;

        const animate = () => {
            if (slideshowContainer) {
                const maxScrollLeft =
                    slideshowContainer.scrollWidth - slideshowContainer.clientWidth;

                slideshowContainer.scrollLeft += speed;

                // Once we hit the max possible scrollLeft value, reset to 0
                if (slideshowContainer.scrollLeft >= maxScrollLeft) {
                    slideshowContainer.scrollLeft = 0;
                }
            }

            requestAnimationFrame(animate);
        };

        requestAnimationFrame(animate);
    }, [speed, images]);

    return (
        <div ref={slideshowContainerRef}
             className="overflow-hidden whitespace-nowrap w-full">
            <div className="flex space-x-4 ">
                {/* Duplicate images array for seamless loop effect */}
                {[...images, ...images].map((image, index) => (
                    <img key={index} src={image} alt={`Slide ${index}`}
                         className="rounded-xl w-auto h-full max-h-72 object-cover inline-block"/>
                ))}
            </div>
        </div>
    );
};
