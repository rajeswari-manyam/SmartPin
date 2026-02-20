import React, { useState, useEffect, useCallback } from 'react';

interface CarouselProps {
    children: React.ReactNode[];
    autoplay?: boolean;
    autoplayDelay?: number;
    showDots?: boolean;
    showArrows?: boolean;
    className?: string;
}

const Carousel: React.FC<CarouselProps> = ({
    children,
    autoplay = false,
    autoplayDelay = 3000,
    showDots = true,
    showArrows = true,
    className = '',
}) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isHovered, setIsHovered] = useState(false);

    const totalSlides = React.Children.count(children);

    const goToSlide = useCallback((index: number) => {
        setCurrentIndex(index);
    }, []);

    const goToPrevious = useCallback(() => {
        setCurrentIndex((prevIndex) =>
            prevIndex === 0 ? totalSlides - 1 : prevIndex - 1
        );
    }, [totalSlides]);

    const goToNext = useCallback(() => {
        setCurrentIndex((prevIndex) =>
            prevIndex === totalSlides - 1 ? 0 : prevIndex + 1
        );
    }, [totalSlides]);

    // Autoplay functionality
    useEffect(() => {
        if (!autoplay || isHovered) return;

        const interval = setInterval(() => {
            goToNext();
        }, autoplayDelay);

        return () => clearInterval(interval);
    }, [autoplay, autoplayDelay, isHovered, goToNext]);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowLeft') goToPrevious();
            if (e.key === 'ArrowRight') goToNext();
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [goToPrevious, goToNext]);

    return (
        <div
            className={`relative w-full ${className}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Slides Container */}
            <div className="relative w-full h-full overflow-hidden">
                <div
                    className="flex transition-transform duration-500 ease-in-out h-full"
                    style={{ transform: `translateX(-${currentIndex * 100}%)` }}
                >
                    {React.Children.map(children, (child, index) => (
                        <div key={index} className="w-full flex-shrink-0 h-full">
                            {child}
                        </div>
                    ))}
                </div>
            </div>

            {/* Previous Arrow */}
            {showArrows && totalSlides > 1 && (
                <button
                    onClick={goToPrevious}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/30 hover:bg-white/50 backdrop-blur-sm text-white p-3 rounded-full transition-all duration-300 hover:scale-110 z-20"
                    aria-label="Previous slide"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={3}
                        stroke="currentColor"
                        className="w-6 h-6"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15.75 19.5L8.25 12l7.5-7.5"
                        />
                    </svg>
                </button>
            )}

            {/* Next Arrow */}
            {showArrows && totalSlides > 1 && (
                <button
                    onClick={goToNext}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/30 hover:bg-white/50 backdrop-blur-sm text-white p-3 rounded-full transition-all duration-300 hover:scale-110 z-20"
                    aria-label="Next slide"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={3}
                        stroke="currentColor"
                        className="w-6 h-6"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M8.25 4.5l7.5 7.5-7.5 7.5"
                        />
                    </svg>
                </button>
            )}

            {/* Dots Navigation */}
            {showDots && totalSlides > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                    {Array.from({ length: totalSlides }).map((_, index) => (
                        <button
                            key={index}
                            onClick={() => goToSlide(index)}
                            className={`transition-all duration-300 rounded-full ${index === currentIndex
                                ? 'bg-white w-8 h-3'
                                : 'bg-white/50 w-3 h-3 hover:bg-white/70'
                                }`}
                            aria-label={`Go to slide ${index + 1}`}
                        />
                    ))}
                </div>
            )}

            {/* Slide Counter (Optional) */}
            {totalSlides > 1 && (
                <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm z-20">
                    {currentIndex + 1} / {totalSlides}
                </div>
            )}
        </div>
    );
};

export default Carousel;
