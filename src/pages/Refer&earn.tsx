import React, { useState } from 'react';
import { ArrowLeft, Copy, Share2, Check } from 'lucide-react';

const ReferAndEarnScreen: React.FC = () => {
  const [referralCode] = useState('SERV12345');
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const message = `🎉 Join ServiceHub and get amazing services!\n\nUse my referral code: ${referralCode}\n\nDownload now: https://servicehub.app`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join ServiceHub',
          text: message,
        });
      } catch (error) {
        console.log('Share cancelled or failed');
      }
    } else {
      // Fallback for browsers that don't support Web Share API
      alert('Share this message:\n\n' + message);
    }
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(referralCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      alert('Failed to copy code');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => window.history.back()}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-gray-900" />
            </button>
            <h1 className="text-lg font-bold text-gray-900">Refer & Earn</h1>
            <div className="w-10" />
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Hero Card */}
        <div className="bg-blue-600 rounded-2xl p-8 mb-6 text-center shadow-lg">
          <div className="text-6xl mb-4">🎁</div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Invite Friends, Earn Rewards!
          </h2>
          <p className="text-white text-sm opacity-90">
            Refer your friends and earn ₹100 for each successful referral
          </p>
        </div>

        {/* Referral Code Card */}
        <div className="bg-white rounded-xl p-6 mb-6 shadow-md">
          <p className="text-sm text-gray-600 mb-3">Your Referral Code</p>
          <div className="flex items-center justify-between">
            <span className="text-3xl font-bold text-blue-600 tracking-wider">
              {referralCode}
            </span>
            <button
              onClick={handleCopyCode}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              {copied ? (
                <>
                  <Check className="w-5 h-5" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-5 h-5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Share Button */}
        <button
          onClick={handleShare}
          className="w-full bg-blue-600 text-white rounded-xl py-4 mb-8 shadow-lg hover:bg-blue-700 transition-colors"
        >
          <div className="flex items-center justify-center gap-2">
            <Share2 className="w-6 h-6" />
            <span className="text-lg font-semibold">Share with Friends</span>
          </div>
        </button>

        {/* How It Works */}
        <div className="bg-white rounded-xl p-6 mb-6 shadow-md">
          <h2 className="text-lg font-bold text-gray-900 mb-6">How It Works</h2>
          
          <div className="space-y-6">
            {/* Step 1 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-lg font-bold text-white">1</span>
              </div>
              <div className="flex-1">
                <h3 className="text-base font-semibold text-gray-900 mb-1">
                  Share Your Code
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Share your unique referral code with friends and family
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-lg font-bold text-white">2</span>
              </div>
              <div className="flex-1">
                <h3 className="text-base font-semibold text-gray-900 mb-1">
                  Friend Signs Up
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Your friend downloads the app and uses your code
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-lg font-bold text-white">3</span>
              </div>
              <div className="flex-1">
                <h3 className="text-base font-semibold text-gray-900 mb-1">
                  Earn Rewards
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Get ₹100 credited to your wallet instantly!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Card */}
        <div className="bg-white rounded-xl p-6 mb-6 shadow-md">
          <div className="flex items-center divide-x divide-gray-200">
            <div className="flex-1 text-center">
              <p className="text-3xl font-bold text-blue-600 mb-1">0</p>
              <p className="text-sm text-gray-600">Total Referrals</p>
            </div>
            <div className="flex-1 text-center">
              <p className="text-3xl font-bold text-blue-600 mb-1">₹0</p>
              <p className="text-sm text-gray-600">Earnings</p>
            </div>
          </div>
        </div>

        {/* Terms & Conditions */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-6">
          <h3 className="text-base font-semibold text-gray-900 mb-3">
            Terms & Conditions
          </h3>
          <div className="text-sm text-gray-600 leading-relaxed space-y-2">
            <p>• Referral reward will be credited after your friend completes their first booking</p>
            <p>• Maximum 10 referrals per user per month</p>
            <p>• Rewards cannot be transferred or exchanged for cash</p>
            <p>• ServiceHub reserves the right to modify the referral program</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ReferAndEarnScreen;
