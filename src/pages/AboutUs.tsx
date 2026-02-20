import React from 'react';
import { ArrowLeft, Target, Eye, Gem, Globe, Mail, Phone, MessageSquare, Rocket, BookOpen, PhoneCall, Heart } from 'lucide-react';

const AboutUs: React.FC = () => {
    const features = [
        {
            id: 1,
            icon: Target,
            title: 'Our Mission',
            description: 'To connect skilled workers with customers seamlessly, making services accessible and reliable for everyone.'
        },
        {
            id: 2,
            icon: Eye,
            title: 'Our Vision',
            description: 'Building a trusted platform where quality service meets genuine needs, fostering growth for workers and satisfaction for customers.'
        },
        {
            id: 3,
            icon: Gem,
            title: 'Our Values',
            description: 'Trust, Quality, Transparency, and Community. We believe in empowering workers and delivering excellence to customers.'
        }
    ];

    const socialLinks = [
        { id: 1, icon: Globe, label: 'Website', url: 'https://yourwebsite.com' },
        { id: 2, icon: Mail, label: 'Email', url: 'mailto:info@yourapp.com' },
        { id: 3, icon: Phone, label: 'Phone', url: 'tel:+1234567890' },
        { id: 4, icon: MessageSquare, label: 'Support', url: '#' },
    ];

    const handleLink = (url: string) => {
        if (url !== '#') {
            window.open(url, '_blank');
        } else {
            console.log('Open Support');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <button
                            onClick={() => window.history.back()}
                            className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 transition-colors"
                        >
                            <ArrowLeft className="w-6 h-6 text-gray-900" />
                        </button>
                        <h1 className="text-lg font-semibold text-gray-900">About Us</h1>
                        <div className="w-10" />
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Hero Card */}
                <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-8 mb-6 text-center shadow-xl">
                    <div className="flex justify-center mb-4">
                        <Rocket className="w-16 h-16 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-3">
                        Welcome to Our Platform
                    </h2>
                    <p className="text-blue-100 text-base mb-6 max-w-2xl mx-auto">
                        Connecting skilled workers with customers who need their expertise
                    </p>
                    <div className="inline-block bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                        <span className="text-white text-sm font-semibold">Version 1.0.0</span>
                    </div>
                </div>

                {/* Our Story Section */}
                <div className="bg-white rounded-xl p-6 mb-6 shadow-sm">
                    <div className="flex items-center mb-4">
                        <BookOpen className="w-6 h-6 text-gray-900 mr-3" />
                        <h3 className="text-xl font-bold text-gray-900">Our Story</h3>
                    </div>
                    <p className="text-gray-600 leading-relaxed">
                        Founded in 2024, we started with a simple idea: make it easier for people to find reliable workers and for skilled professionals to find meaningful work. Today, we're proud to serve thousands of users across multiple cities, creating opportunities and building trust in every interaction.
                    </p>
                </div>

                {/* Mission, Vision, Values Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                    {features.map((feature) => (
                        <div
                            key={feature.id}
                            className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-center mb-3">
                                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                                    <feature.icon className="w-6 h-6 text-blue-600" />
                                </div>
                                <h4 className="text-lg font-semibold text-gray-900">{feature.title}</h4>
                            </div>
                            <p className="text-gray-600 leading-relaxed text-sm">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Contact Section */}
                <div className="bg-white rounded-xl p-6 mb-6 shadow-sm">
                    <div className="flex items-center mb-6">
                        <PhoneCall className="w-6 h-6 text-gray-900 mr-3" />
                        <h3 className="text-xl font-bold text-gray-900">Get in Touch</h3>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {socialLinks.map((link) => (
                            <button
                                key={link.id}
                                onClick={() => handleLink(link.url)}
                                className="flex flex-col items-center p-4 rounded-lg hover:bg-gray-50 transition-colors group"
                            >
                                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-3 group-hover:bg-blue-100 transition-colors">
                                    <link.icon className="w-8 h-8 text-blue-600" />
                                </div>
                                <span className="text-sm font-semibold text-blue-600">
                                    {link.label}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="bg-gray-100 rounded-xl p-6 text-center">
                    <div className="flex items-center justify-center mb-2">
                        <span className="text-gray-600">Made with</span>
                        <Heart className="w-4 h-4 text-red-500 mx-1 fill-current" />
                        <span className="text-gray-600">for connecting people</span>
                    </div>
                    <p className="text-sm text-gray-500">
                        © 2026 Your App. All rights reserved.
                    </p>
                </div>
            </main>
        </div>
    );
};

export default AboutUs;
