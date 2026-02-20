import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface Section {
    id: number;
    title: string;
    icon: string;
    content: string;
}

const PrivacyPolicyScreen: React.FC = () => {
    const sections: Section[] = [
        {
            id: 1,
            title: 'Information We Collect',
            icon: '📋',
            content: 'We collect information you provide directly to us, including your name, email address, phone number, and any other information you choose to provide. When you use our services, we automatically collect certain information about your device and usage patterns.'
        },
        {
            id: 2,
            title: 'How We Use Your Information',
            icon: '🔍',
            content: 'We use the information we collect to provide, maintain, and improve our services, to process your transactions, to send you technical notices and support messages, and to communicate with you about products, services, and events.'
        },
        {
            id: 3,
            title: 'Information Sharing',
            icon: '🤝',
            content: 'We do not share your personal information with third parties except as described in this policy. We may share information with service providers who perform services on our behalf, and when required by law or to protect our rights.'
        },
        {
            id: 4,
            title: 'Data Security',
            icon: '🔒',
            content: 'We take reasonable measures to help protect your personal information from loss, theft, misuse, unauthorized access, disclosure, alteration, and destruction. However, no internet or email transmission is ever fully secure or error-free.'
        },
        {
            id: 5,
            title: 'Your Rights',
            icon: '⚖️',
            content: 'You have the right to access, update, or delete your personal information at any time. You may also opt out of receiving promotional communications from us by following the instructions in those messages.'
        },
        {
            id: 6,
            title: 'Cookies and Tracking',
            icon: '🍪',
            content: 'We use cookies and similar tracking technologies to collect information about your browsing activities. You can control cookies through your browser settings and other tools.'
        },
        {
            id: 7,
            title: 'Children\'s Privacy',
            icon: '👶',
            content: 'Our services are not directed to children under 13. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us.'
        },
        {
            id: 8,
            title: 'Changes to This Policy',
            icon: '📝',
            content: 'We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last Updated" date.'
        },
        {
            id: 9,
            title: 'Contact Us',
            icon: '📧',
            content: 'If you have any questions about this privacy policy or our practices, please contact us at privacy@yourapp.com or through our support channels in the app.'
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <button
                            onClick={() => window.history.back()}
                            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                        >
                            <ArrowLeft className="w-6 h-6 text-gray-900" />
                        </button>
                        <h1 className="text-lg font-semibold text-gray-900">Privacy Policy</h1>
                        <div className="w-10" />
                    </div>
                </div>
            </header>

            {/* Content */}
            <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* Introduction Card */}
                <div className="bg-white rounded-xl p-6 mb-4 text-center shadow-sm">
                    <div className="text-5xl mb-3">🔒</div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">
                        Your Privacy Matters
                    </h2>
                    <p className="text-sm text-gray-600 leading-relaxed mb-3">
                        We are committed to protecting your privacy and ensuring the security of your personal information.
                    </p>
                    <p className="text-xs text-gray-500 italic">
                        Last Updated: January 12, 2026
                    </p>
                </div>

                {/* Policy Sections */}
                <div className="space-y-4">
                    {sections.map((section, index) => (
                        <div
                            key={section.id}
                            className="bg-white rounded-xl p-4 shadow-sm"
                        >
                            <div className="flex items-center mb-2">
                                <span className="text-xl mr-2">{section.icon}</span>
                                <span className="text-base font-bold text-blue-600 mr-2">
                                    {index + 1}.
                                </span>
                                <h3 className="text-base font-semibold text-gray-900">
                                    {section.title}
                                </h3>
                            </div>
                            <p className="text-sm text-gray-600 leading-relaxed pl-7">
                                {section.content}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div className="bg-gray-100 rounded-xl p-4 mt-6 mb-6">
                    <p className="text-sm text-gray-600 text-center leading-relaxed">
                        By using our services, you agree to this Privacy Policy.
                    </p>
                </div>
            </main>
        </div>
    );
};

export default PrivacyPolicyScreen;
