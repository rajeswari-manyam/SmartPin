import React, { useState } from 'react';
import { ArrowLeft, Mail, Phone, MessageCircle, Ticket, Shield, Info } from 'lucide-react';

interface FAQ {
    id: string;
    question: string;
    answer: string;
}

interface ContactOption {
    id: string;
    icon: React.ReactNode;
    title: string;
    subtitle: string;
    action: () => void;
}

interface QuickLink {
    id: string;
    icon: React.ReactNode;
    title: string;
    action: () => void;
}

const HelpScreen: React.FC = () => {
    const [expandedFaq, setExpandedFaq] = useState<string | null>(null);

    const faqs: FAQ[] = [
        {
            id: '1',
            question: 'How do I create an account?',
            answer: 'To create an account, tap on the "Sign Up" button on the welcome screen. Enter your phone number and verify it with the OTP sent to you. Then complete your profile by adding your details.',
        },
        {
            id: '2',
            question: 'How do I post a job?',
            answer: 'After logging in as a customer, navigate to the Home screen and tap the "Post Job" button. Fill in the job details including category, description, location, and budget. Submit to post your job.',
        },
        {
            id: '3',
            question: 'How do I find workers?',
            answer: 'Browse workers by category from the Categories screen. You can filter by location, rating, and price. Tap on any worker profile to view their details and send an enquiry.',
        },
        {
            id: '4',
            question: 'How does payment work?',
            answer: 'Payment terms are agreed upon between you and the worker before starting the job. You can discuss and finalize payment details through the chat feature or during the initial enquiry.',
        },
        {
            id: '5',
            question: 'Can I switch between Customer and Worker modes?',
            answer: 'Yes! Go to your Account screen and use the "Switch Account" toggle to switch between Customer (Guest) and Worker modes. Your profile data is maintained separately for each mode.',
        },
        {
            id: '6',
            question: 'How do I contact support?',
            answer: 'You can contact support by raising a ticket from the Account > Support > Raise Ticket screen. Alternatively, use the contact options below to reach us directly.',
        },
        {
            id: '7',
            question: 'How do I update my profile?',
            answer: 'Go to Account > My Profile to update your personal information, profile picture, and bio. Workers can also manage their skills and rates from the Worker Skills section.',
        },
        {
            id: '8',
            question: 'What if I forget my password?',
            answer: 'Our app uses phone number verification with OTP, so you don\'t need a password. Simply enter your phone number on the login screen to receive a new OTP.',
        },
    ];

    const handleEmail = () => {
        window.location.href = 'mailto:support@yourapp.com?subject=Support Request';
    };

    const handleCall = () => {
        window.location.href = 'tel:+12345678900';
    };

    const handleChat = () => {
        alert('Live chat feature coming soon! For now, please email us at support@yourapp.com');
    };

    const handleRaiseTicket = () => {
        alert('Navigate to Raise Ticket page');
    };

    const handlePrivacyPolicy = () => {
        alert('Navigate to Privacy Policy page');
    };

    const handleAboutUs = () => {
        alert('Navigate to About Us page');
    };

    const contactOptions: ContactOption[] = [
        {
            id: '1',
            icon: <Mail className="w-8 h-8" />,
            title: 'Email Support',
            subtitle: 'support@yourapp.com',
            action: handleEmail,
        },
        {
            id: '2',
            icon: <Phone className="w-8 h-8" />,
            title: 'Call Us',
            subtitle: '+1 (234) 567-8900',
            action: handleCall,
        },
        {
            id: '3',
            icon: <MessageCircle className="w-8 h-8" />,
            title: 'Live Chat',
            subtitle: 'Chat with our team',
            action: handleChat,
        },
        {
            id: '4',
            icon: <Ticket className="w-8 h-8" />,
            title: 'Raise a Ticket',
            subtitle: 'Submit a support request',
            action: handleRaiseTicket,
        },
    ];

    const quickLinks: QuickLink[] = [
        {
            id: '1',
            icon: <Shield className="w-10 h-10" />,
            title: 'Privacy Policy',
            action: handlePrivacyPolicy,
        },
        {
            id: '2',
            icon: <Info className="w-10 h-10" />,
            title: 'About Us',
            action: handleAboutUs,
        },
    ];

    const toggleFaq = (id: string) => {
        setExpandedFaq(expandedFaq === id ? null : id);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <button
                            onClick={() => window.history.back()}
                            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                        >
                            <ArrowLeft className="w-6 h-6 text-gray-900" />
                        </button>
                        <h1 className="text-lg font-semibold text-gray-900">Help & Support</h1>
                        <div className="w-10" />
                    </div>
                </div>
            </header>

            {/* Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* Hero Card */}
                <div className="bg-blue-600 rounded-2xl p-8 mb-8 text-center shadow-lg">
                    <div className="text-6xl mb-4">❓</div>
                    <h2 className="text-2xl font-bold text-white mb-2">How can we help you?</h2>
                    <p className="text-white text-sm opacity-90">
                        Find answers to common questions or reach out to our support team.
                    </p>
                </div>

                {/* Contact Options */}
                <section className="mb-8">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Contact Us</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {contactOptions.map((option) => (
                            <button
                                key={option.id}
                                onClick={option.action}
                                className="bg-white rounded-xl p-6 text-center hover:shadow-md transition-shadow border border-gray-100"
                            >
                                <div className="flex justify-center text-blue-600 mb-3">
                                    {option.icon}
                                </div>
                                <h3 className="text-sm font-semibold text-gray-900 mb-1">{option.title}</h3>
                                <p className="text-xs text-gray-600">{option.subtitle}</p>
                            </button>
                        ))}
                    </div>
                </section>

                {/* FAQ Section */}
                <section className="mb-8">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
                    <div className="space-y-3">
                        {faqs.map((faq) => (
                            <div
                                key={faq.id}
                                className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
                            >
                                <button
                                    onClick={() => toggleFaq(faq.id)}
                                    className="w-full flex items-center justify-between text-left"
                                >
                                    <h3 className="text-sm font-semibold text-gray-900 pr-4">{faq.question}</h3>
                                    <span className="text-2xl font-bold text-blue-600 flex-shrink-0">
                                        {expandedFaq === faq.id ? '−' : '+'}
                                    </span>
                                </button>
                                {expandedFaq === faq.id && (
                                    <p className="text-sm text-gray-600 mt-3 pt-3 border-t border-gray-100 leading-relaxed">
                                        {faq.answer}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                </section>

                {/* Quick Links */}
                <section className="mb-8">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Links</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {quickLinks.map((link) => (
                            <button
                                key={link.id}
                                onClick={link.action}
                                className="bg-white rounded-xl p-6 text-center hover:shadow-md transition-shadow border border-gray-100"
                            >
                                <div className="flex justify-center text-blue-600 mb-3">
                                    {link.icon}
                                </div>
                                <h3 className="text-sm font-semibold text-gray-900">{link.title}</h3>
                            </button>
                        ))}
                    </div>
                </section>
            </main>
        </div>
    );
};

export default HelpScreen;
