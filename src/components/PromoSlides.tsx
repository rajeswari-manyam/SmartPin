import React from "react";
import { useNavigate } from "react-router-dom";

import Carousel from "./ui/Carousel";
import { fontSize, fontWeight, responsiveFontSize } from "../styles/typography";
import promoslides from "../assets/icons/Promoslides.png";

interface PromoSlide {
    id: string;
    title?: string;
    image?: string;
    subtitle: string;
    description: string;
    buttonText: string;
    gradient: string;
    textColor: string;
    path: string;
}

interface PromoSlidesProps {
    className?: string;
}

const PromoSlides: React.FC<PromoSlidesProps> = ({ className = "" }) => {
    const navigate = useNavigate();

    const slides: PromoSlide[] = [
        // 🎯 FIRST SLIDE - Featured Promo with Image
        {
            id: "1",
            image: promoslides, // Using the imported image
            subtitle: "Find Your Perfect Job",
            description: "Connect with top employers and discover opportunities that match your skills",
            buttonText: "Explore Jobs",
            gradient: "from-blue-600 via-purple-600 to-pink-600",
            textColor: "text-white",
            path: "/jobs",
        },
        // Other slides with text-based content
        {
            id: "2",
            title: "Part Time",
            subtitle: "Flexible Part Time Jobs",
            description: "Work on your schedule with part-time opportunities across various industries",
            buttonText: "Browse Part Time",
            gradient: "from-purple-600 via-pink-600 to-red-600",
            textColor: "text-white",
            path: "/jobs?type=part-time",
        },
        {
            id: "3",
            title: "Remote",
            subtitle: "Work From Anywhere",
            description: "Discover remote positions that let you work from the comfort of your home",
            buttonText: "Find Remote Jobs",
            gradient: "from-blue-600 via-indigo-600 to-purple-600",
            textColor: "text-white",
            path: "/jobs?type=remote",
        },
        {
            id: "4",
            title: "Student",
            subtitle: "Student Opportunities",
            description: "Internships and entry-level positions perfect for students and fresh graduates",
            buttonText: "Student Jobs",
            gradient: "from-green-600 via-teal-600 to-cyan-600",
            textColor: "text-white",
            path: "/jobs?type=student",
        },
        {
            id: "5",
            title: "Flexible",
            subtitle: "Flexible Work Hours",
            description: "Find jobs that adapt to your lifestyle with flexible scheduling options",
            buttonText: "View Flexible",
            gradient: "from-orange-600 via-red-600 to-pink-600",
            textColor: "text-white",
            path: "/jobs?type=flexible",
        },
        {
            id: "6",
            title: "High Paying",
            subtitle: "Premium Opportunities",
            description: "Explore high-paying positions with competitive salaries and benefits",
            buttonText: "High Paying Jobs",
            gradient: "from-yellow-600 via-orange-600 to-red-600",
            textColor: "text-white",
            path: "/jobs?type=high-paying",
        },
    ];

    return (
        <div className={`w-full ${className}`}>
            <Carousel
                autoplay={true}
                autoplayDelay={5000}
                showDots={true}
                showArrows={true}
                className="h-80 rounded-xl shadow-lg overflow-hidden"
            >
                {slides.map((slide, index) => (
                    <div
                        key={slide.id}
                        className={`relative h-80 flex items-center justify-center overflow-hidden rounded-xl bg-gradient-to-r ${slide.gradient}`}
                    >
                        {/* First slide with image background */}
                        {slide.image && index === 0 ? (
                            <>
                                {/* Background Image */}
                                <div className="absolute inset-0">
                                    <img
                                        src={slide.image}
                                        alt="Promo"
                                        className="w-full h-full object-cover"
                                    />
                                    {/* Gradient overlay for text readability */}
                                    <div className={`absolute inset-0 bg-gradient-to-r ${slide.gradient} opacity-70`} />
                                </div>

                                {/* Content */}
                                <div className="relative z-10 text-center px-4 md:px-8 max-w-3xl">
                                    <div className="space-y-3 md:space-y-4">
                                        {/* Subtitle */}
                                        <h2
                                            className={`${responsiveFontSize["3xl"]} ${fontWeight.bold} ${slide.textColor} tracking-wide drop-shadow-2xl`}
                                        >
                                            {slide.subtitle}
                                        </h2>

                                        {/* Description */}
                                        <p
                                            className={`${responsiveFontSize.lg} ${slide.textColor} max-w-2xl mx-auto drop-shadow-lg`}
                                        >
                                            {slide.description}
                                        </p>

                                        {/* Button */}
                                        <button
                                            onClick={() => navigate(slide.path)}
                                            className={`mt-4 md:mt-6 bg-white text-gray-800 px-8 md:px-10 py-3 md:py-4 rounded-full ${fontWeight.bold} ${responsiveFontSize.lg} hover:bg-gray-100 transition-all duration-300 shadow-2xl hover:shadow-3xl hover:scale-105 transform`}
                                        >
                                            {slide.buttonText} →
                                        </button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                {/* Animated background pattern for other slides */}
                                <div className="absolute inset-0 opacity-10">
                                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.8),transparent_50%)]" />
                                    <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.1)_25%,rgba(255,255,255,0.1)_50%,transparent_50%,transparent_75%,rgba(255,255,255,0.1)_75%)] bg-[length:60px_60px] animate-pulse" />
                                </div>

                                {/* Content */}
                                <div className="relative z-10 text-center px-4 md:px-8 max-w-3xl">
                                    <div className="space-y-3 md:space-y-4">
                                        {/* Title */}
                                        {slide.title && (
                                            <div
                                                className={`${responsiveFontSize["4xl"]} ${fontWeight.extrabold} ${slide.textColor} tracking-tight drop-shadow-lg`}
                                            >
                                                {slide.title}
                                            </div>
                                        )}

                                        {/* Subtitle */}
                                        <h2
                                            className={`${responsiveFontSize["2xl"]} ${fontWeight.semibold} ${slide.textColor} tracking-wide drop-shadow-md`}
                                        >
                                            {slide.subtitle}
                                        </h2>

                                        {/* Description */}
                                        <p
                                            className={`${responsiveFontSize.base} ${slide.textColor} max-w-2xl mx-auto drop-shadow-md`}
                                        >
                                            {slide.description}
                                        </p>

                                        {/* Button */}
                                        <button
                                            onClick={() => navigate(slide.path)}
                                            className={`mt-4 md:mt-6 bg-white text-gray-800 px-6 md:px-8 py-2.5 md:py-3 rounded-full ${fontWeight.bold} ${responsiveFontSize.base} hover:bg-gray-100 transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 transform`}
                                        >
                                            {slide.buttonText} →
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                ))}
            </Carousel>
        </div>
    );
};

export default PromoSlides;
